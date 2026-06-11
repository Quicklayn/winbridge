import {
  createRelayPairingConfig,
  createRelayPortConfig,
  createRelayRuntime,
  createRelaySharedTokenConfig
} from "./server.js";

const runtime = createRelayRuntime({
  port: createRelayPortConfig(process.env),
  sharedToken: createRelaySharedTokenConfig(process.env),
  pairing: createRelayPairingConfig(process.env)
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
