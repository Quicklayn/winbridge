import { FileAuditSink } from "@winbridge/audit-log";
import { parseArgs } from "./args.js";
import { reportAgentShellCliError } from "./cli-diagnostics.js";
import { installAgentShellSignalShutdown } from "./cli-shutdown.js";
import { createInteractiveHostDecisionProvider } from "./host-consent-prompt.js";
import { startInteractiveHostControlPrompt, type HostControlPromptHandle } from "./host-control-prompt.js";
import {
  shouldStartHostControlPromptAfterEvent,
  shouldStartHostControlPromptImmediately
} from "./host-control-sequencer.js";
import { scheduleHostStatusPrint, type HostStatusPrintHandle } from "./host-status.js";
import {
  scheduleDevelopmentCapturedScreenFrameSend,
  scheduleDevelopmentCapturedScreenFrameStream,
  scheduleDevelopmentInputEventSend,
  scheduleDevelopmentScreenFrameSend,
  scheduleDevelopmentScreenFrameStream,
  type RemoteInteractionCliHandle
} from "./remote-interaction-cli.js";
import { createAgentShellRuntime, type AgentShellRuntime } from "./runtime.js";
import { FileViewerScreenFrameOutputSink } from "./screen-frame-output.js";
import {
  startInteractiveViewerControlPrompt,
  type ViewerControlPromptHandle
} from "./viewer-control-prompt.js";
import {
  startViewerLocalControlSurface,
  type ViewerLocalControlSurfaceHandle
} from "./viewer-local-control-surface.js";
import { scheduleViewerLocalDisconnect, type ViewerLocalDisconnectHandle } from "./viewer-disconnect.js";
import { scheduleViewerStatusPrint, type ViewerStatusPrintHandle } from "./viewer-status.js";

try {
  const args = parseArgs(process.argv.slice(2));
  let hostControlPrompt: HostControlPromptHandle | undefined;
  let hostStatusPrint: HostStatusPrintHandle | undefined;
  let viewerControlPrompt: ViewerControlPromptHandle | undefined;
  let viewerLocalControlSurface: ViewerLocalControlSurfaceHandle | undefined;
  let viewerLocalDisconnect: ViewerLocalDisconnectHandle | undefined;
  let viewerStatusPrint: ViewerStatusPrintHandle | undefined;
  let devScreenFrameSend: RemoteInteractionCliHandle | undefined;
  let devInputEventSend: RemoteInteractionCliHandle | undefined;
  let runtime: AgentShellRuntime | undefined;
  const startHostControlPrompt = () => {
    if (runtime === undefined || hostControlPrompt !== undefined) {
      return;
    }

    hostControlPrompt = startInteractiveHostControlPrompt(runtime);
  };
  runtime = createAgentShellRuntime({
    ...args,
    hostDecisionProvider: args.hostConsentPrompt
      ? createInteractiveHostDecisionProvider({ timeoutMs: args.hostConsentTimeoutMs })
      : undefined,
    viewerScreenFrameOutputSink: args.viewerScreenFrameOutputPath
      ? new FileViewerScreenFrameOutputSink(args.viewerScreenFrameOutputPath)
      : undefined,
    auditSink: args.auditLogPath ? new FileAuditSink(args.auditLogPath) : undefined,
    logger: console,
    onEvent: (event) => {
      if (shouldStartHostControlPromptAfterEvent(args, hostControlPrompt !== undefined, event)) {
        startHostControlPrompt();
      }
    }
  });

  const shutdown = async () => {
    hostControlPrompt?.stop();
    hostStatusPrint?.stop();
    viewerControlPrompt?.stop();
    await viewerLocalControlSurface?.stop();
    viewerLocalDisconnect?.stop();
    viewerStatusPrint?.stop();
    devScreenFrameSend?.stop();
    devInputEventSend?.stop();
    await runtime?.stop();
  };

  installAgentShellSignalShutdown({
    signalTarget: process,
    shutdown,
    reportError: reportAgentShellCliError,
    exit: (code) => {
      process.exit(code);
    }
  });

  runtime
    .start()
    .then(async () => {
      if (shouldStartHostControlPromptImmediately(args)) {
        startHostControlPrompt();
      }

      if (args.hostStatusAfterMs !== undefined) {
        hostStatusPrint = scheduleHostStatusPrint(runtime, args.hostStatusAfterMs);
      }

      if (args.viewerControlPrompt) {
        viewerControlPrompt = startInteractiveViewerControlPrompt(runtime);
      }

      if (args.viewerControlSurfacePort !== undefined) {
        if (args.viewerScreenFrameOutputPath === undefined) {
          throw new Error("Viewer local control surface requires screen-frame output");
        }

        viewerLocalControlSurface = await startViewerLocalControlSurface(runtime, {
          port: args.viewerControlSurfacePort,
          framePath: args.viewerScreenFrameOutputPath,
          logger: console
        });
      }

      if (args.viewerStatusAfterMs !== undefined) {
        viewerStatusPrint = scheduleViewerStatusPrint(runtime, args.viewerStatusAfterMs);
      }

      if (args.viewerDisconnectAfterMs !== undefined) {
        viewerLocalDisconnect = scheduleViewerLocalDisconnect(
          runtime,
          args.viewerDisconnectAfterMs
        );
      }

      if (args.devScreenFrame) {
        if (args.devScreenFrame.source === "windows-capture") {
          devScreenFrameSend = args.devScreenFrame.stream
            ? scheduleDevelopmentCapturedScreenFrameStream(runtime, {
                ...args.devScreenFrame,
                stream: args.devScreenFrame.stream
              })
            : scheduleDevelopmentCapturedScreenFrameSend(runtime, args.devScreenFrame);
        } else {
          devScreenFrameSend = args.devScreenFrame.stream
            ? scheduleDevelopmentScreenFrameStream(runtime, {
                ...args.devScreenFrame,
                stream: args.devScreenFrame.stream
              })
            : scheduleDevelopmentScreenFrameSend(runtime, args.devScreenFrame);
        }
      }

      if (args.devInputEvent) {
        devInputEventSend = scheduleDevelopmentInputEventSend(runtime, args.devInputEvent);
      }
    })
    .catch((error) => {
      reportAgentShellCliError(error);
      process.exit(1);
    });
} catch (error) {
  reportAgentShellCliError(error);
  process.exit(1);
}
