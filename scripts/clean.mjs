import { rm } from "node:fs/promises";

for (const path of ["apps/agent-shell/dist", "apps/relay/dist", "packages/protocol/dist"]) {
  await rm(path, { force: true, recursive: true });
}
