import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const DEFAULT_TEST_ROOTS = ["apps", "packages"];
export const VITEST_SERIAL_FLAGS = [
  "--pool",
  "forks",
  "--maxWorkers",
  "1",
  "--minWorkers",
  "1",
  "--no-file-parallelism",
  "--reporter",
  "dot"
];

const TRANSIENT_VITEST_IPC_PATTERNS = [/\bERR_IPC_CHANNEL_CLOSED\b/, /\bChannel closed\b/];
const DEFAULT_MAX_BUFFER_BYTES = 64 * 1024 * 1024;

export function defaultVitestBin(cwd = process.cwd()) {
  return join(cwd, "node_modules", "vitest", "vitest.mjs");
}

export function discoverTestFiles(roots = DEFAULT_TEST_ROOTS, cwd = process.cwd()) {
  return prioritizeTestFiles(roots.flatMap((root) => findTestFiles(root, cwd)).sort());
}

export function findTestFiles(root, cwd = process.cwd()) {
  const absoluteRoot = join(cwd, root);
  const entries = readdirSync(absoluteRoot);
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(absoluteRoot, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...findTestFiles(relative(cwd, absolutePath), cwd));
      continue;
    }

    if (stats.isFile() && absolutePath.endsWith(".test.ts")) {
      files.push(relative(cwd, absolutePath).replaceAll("\\", "/"));
    }
  }

  return files;
}

export function prioritizeTestFiles(files) {
  const priority = new Map([
    ["apps/agent-shell/src/runtime.integration.test.ts", 0],
    ["apps/relay/src/server.integration.test.ts", 1]
  ]);

  return [...files].sort((left, right) => {
    const leftPriority = priority.get(left) ?? Number.POSITIVE_INFINITY;
    const rightPriority = priority.get(right) ?? Number.POSITIVE_INFINITY;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.localeCompare(right);
  });
}

export function buildVitestArgs(testFile, vitestBin = defaultVitestBin()) {
  return [vitestBin, "run", testFile, ...VITEST_SERIAL_FLAGS];
}

export function isTransientVitestIpcFailure(output) {
  return TRANSIENT_VITEST_IPC_PATTERNS.some((pattern) => pattern.test(output));
}

export function spawnOutputText(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

export function shouldRetryVitestRun(result) {
  return (result.status ?? 1) !== 0 && !result.error && isTransientVitestIpcFailure(spawnOutputText(result));
}

export function replaySpawnOutput(result, streams = {}) {
  const stdout = streams.stdout ?? process.stdout;
  const stderr = streams.stderr ?? process.stderr;

  if (result.stdout) {
    stdout.write(result.stdout);
  }

  if (result.stderr) {
    stderr.write(result.stderr);
  }
}

export function runVitest(testFile, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const vitestCommand = options.vitestCommand ?? process.execPath;
  const vitestBin = options.vitestBin ?? defaultVitestBin(cwd);
  const spawn = options.spawn ?? spawnSync;

  return spawn(vitestCommand, buildVitestArgs(testFile, vitestBin), {
    cwd,
    encoding: "utf8",
    maxBuffer: options.maxBuffer ?? DEFAULT_MAX_BUFFER_BYTES,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

export function runTestFile(testFile, options = {}) {
  const stderr = options.streams?.stderr ?? process.stderr;
  let result = runVitest(testFile, options);
  replaySpawnOutput(result, options.streams);

  if (result.error) {
    stderr.write(`Failed to start Vitest for ${testFile}: ${result.error.message}\n`);
    return { status: 1, attempts: 1 };
  }

  if (shouldRetryVitestRun(result)) {
    stderr.write(`Vitest hit transient IPC failure for ${testFile}; retrying once.\n`);
    result = runVitest(testFile, options);
    replaySpawnOutput(result, options.streams);

    if (result.error) {
      stderr.write(`Failed to start Vitest for ${testFile}: ${result.error.message}\n`);
      return { status: 1, attempts: 2 };
    }

    return { status: result.status ?? 1, attempts: 2 };
  }

  return { status: result.status ?? 1, attempts: 1 };
}

export function runTestFiles(testFiles, options = {}) {
  const stderr = options.streams?.stderr ?? process.stderr;

  if (testFiles.length === 0) {
    stderr.write("No test files found.\n");
    return 1;
  }

  for (const testFile of testFiles) {
    const result = runTestFile(testFile, options);

    if (result.status !== 0) {
      stderr.write(`Vitest failed for ${testFile}.\n`);
      return result.status;
    }
  }

  return 0;
}
