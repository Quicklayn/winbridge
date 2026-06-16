import { FileAuditSink } from "@winbridge/audit-log";
import { parseArgs } from "./args.js";
import { reportAgentShellCliError } from "./cli-diagnostics.js";
import { createInteractiveHostDecisionProvider } from "./host-consent-prompt.js";
import { startInteractiveHostControlPrompt, type HostControlPromptHandle } from "./host-control-prompt.js";
import { scheduleHostStatusPrint, type HostStatusPrintHandle } from "./host-status.js";
import {
  scheduleDevelopmentCapturedScreenFrameSend,
  scheduleDevelopmentCapturedScreenFrameStream,
  scheduleDevelopmentInputEventSend,
  scheduleDevelopmentScreenFrameSend,
  scheduleDevelopmentScreenFrameStream,
  type RemoteInteractionCliHandle
} from "./remote-interaction-cli.js";
import { createAgentShellRuntime } from "./runtime.js";
import {
  startInteractiveViewerControlPrompt,
  type ViewerControlPromptHandle
} from "./viewer-control-prompt.js";
import { scheduleViewerLocalDisconnect, type ViewerLocalDisconnectHandle } from "./viewer-disconnect.js";
import { scheduleViewerStatusPrint, type ViewerStatusPrintHandle } from "./viewer-status.js";

try {
  const args = parseArgs(process.argv.slice(2));
  let hostControlPrompt: HostControlPromptHandle | undefined;
  let hostStatusPrint: HostStatusPrintHandle | undefined;
  let viewerControlPrompt: ViewerControlPromptHandle | undefined;
  let viewerLocalDisconnect: ViewerLocalDisconnectHandle | undefined;
  let viewerStatusPrint: ViewerStatusPrintHandle | undefined;
  let devScreenFrameSend: RemoteInteractionCliHandle | undefined;
  let devInputEventSend: RemoteInteractionCliHandle | undefined;
  const runtime = createAgentShellRuntime({
    ...args,
    hostDecisionProvider: args.hostConsentPrompt
      ? createInteractiveHostDecisionProvider({ timeoutMs: args.hostConsentTimeoutMs })
      : undefined,
    auditSink: args.auditLogPath ? new FileAuditSink(args.auditLogPath) : undefined
  });

  const shutdown = async () => {
    hostControlPrompt?.stop();
    hostStatusPrint?.stop();
    viewerControlPrompt?.stop();
    viewerLocalDisconnect?.stop();
    viewerStatusPrint?.stop();
    devScreenFrameSend?.stop();
    devInputEventSend?.stop();
    await runtime.stop();
  };

  process.on("SIGINT", () => {
    shutdown()
      .then(() => process.exit(0))
      .catch((error) => {
        reportAgentShellCliError(error);
        process.exit(1);
      });
  });

  process.on("SIGTERM", () => {
    shutdown()
      .then(() => process.exit(0))
      .catch((error) => {
        reportAgentShellCliError(error);
        process.exit(1);
      });
  });

  runtime
    .start()
    .then(() => {
      if (args.hostControlPrompt) {
        hostControlPrompt = startInteractiveHostControlPrompt(runtime);
      }

      if (args.hostStatusAfterMs !== undefined) {
        hostStatusPrint = scheduleHostStatusPrint(runtime, args.hostStatusAfterMs);
      }

      if (args.viewerControlPrompt) {
        viewerControlPrompt = startInteractiveViewerControlPrompt(runtime);
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
