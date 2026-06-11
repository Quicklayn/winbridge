import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@winbridge/audit-log": fileURLToPath(new URL("./packages/audit-log/src/index.ts", import.meta.url)),
      "@winbridge/protocol": fileURLToPath(new URL("./packages/protocol/src/index.ts", import.meta.url))
    }
  },
  test: {
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
    environment: "node"
  }
});
