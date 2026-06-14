import { DEFAULT_TEST_ROOTS, discoverTestFiles, runTestFiles } from "./run-tests-lib.mjs";

const testFiles = discoverTestFiles(DEFAULT_TEST_ROOTS);
const status = runTestFiles(testFiles);

process.exit(status);
