import { FileAuditSink } from "@winbridge/audit-log";
import { AgentShellUsageError, parseArgs } from "./args.js";
import { createAgentShellRuntime } from "./runtime.js";

try {
  const args = parseArgs(process.argv.slice(2));
  const runtime = createAgentShellRuntime({
    ...args,
    auditSink: args.auditLogPath ? new FileAuditSink(args.auditLogPath) : undefined
  });

  const shutdown = async () => {
    await runtime.stop();
  };

  process.on("SIGINT", () => {
    shutdown()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });

  process.on("SIGTERM", () => {
    shutdown()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });

  runtime.start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} catch (error) {
  console.error(error instanceof AgentShellUsageError ? error.message : error);
  process.exit(1);
}
