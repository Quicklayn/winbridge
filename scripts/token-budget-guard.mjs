const DAILY_DEFAULT_LIMIT = 100_000_000;
const CYCLE_DEFAULT_LIMIT = 2_000_000;
const UTC_CUTOFF_DEFAULT_HOUR = 13;

const allowUnknown = process.env.WINBRIDGE_TOKEN_GUARD_ALLOW_UNKNOWN === "1";
const utcCutoffHour = readUtcCutoffHour(
  "WINBRIDGE_WORK_CUTOFF_UTC_HOUR",
  UTC_CUTOFF_DEFAULT_HOUR
);
const nowUtc = readNowUtc("WINBRIDGE_TOKEN_GUARD_NOW_UTC");

const checks = [
  {
    name: "daily",
    usageEnv: "WINBRIDGE_TOKEN_USAGE_DAILY",
    limitEnv: "WINBRIDGE_TOKEN_LIMIT_DAILY",
    defaultLimit: DAILY_DEFAULT_LIMIT,
    maxRatio: 1,
    hardLimitText: "100000000 tokens per day"
  },
  {
    name: "cycle",
    usageEnv: "WINBRIDGE_TOKEN_USAGE_CYCLE",
    limitEnv: "WINBRIDGE_TOKEN_LIMIT_CYCLE",
    defaultLimit: CYCLE_DEFAULT_LIMIT,
    maxRatio: 1,
    hardLimitText: "2000000 tokens per work cycle"
  }
];

const failures = [];
const warnings = [];
const summaries = [];

if (!utcCutoffHour.ok) {
  failures.push(utcCutoffHour.message);
} else if (!nowUtc.ok) {
  failures.push(nowUtc.message);
} else if (nowUtc.value.getUTCHours() >= utcCutoffHour.value) {
  failures.push(
    `utc-cutoff: current UTC time is at or after ${formatUtcHour(
      utcCutoffHour.value
    )}; stop WinBridge project work`
  );
} else {
  summaries.push(
    `utc-cutoff: before ${formatUtcHour(utcCutoffHour.value)} (${nowUtc.value.toISOString()})`
  );
}

for (const check of checks) {
  const usage = readNonNegativeInteger(check.usageEnv);
  const limit =
    check.defaultLimit === undefined
      ? readPositiveInteger(check.limitEnv)
      : readPositiveInteger(check.limitEnv, check.defaultLimit);

  if (!usage.ok || !limit.ok) {
    const missing = [usage, limit]
      .filter((result) => !result.ok)
      .map((result) => result.message)
      .join("; ");
    const message = `${check.name}: ${missing}`;
    if (allowUnknown) {
      warnings.push(message);
      continue;
    }

    failures.push(`${message}. Budget data is required before autonomous work.`);
    continue;
  }

  const ratio = usage.value / limit.value;
  summaries.push(
    `${check.name}: ${usage.value}/${limit.value} tokens (${(ratio * 100).toFixed(2)}%)`
  );

  if (ratio >= check.maxRatio) {
    failures.push(
      `${check.name}: usage reached ${(ratio * 100).toFixed(2)}%; stop at ${check.hardLimitText}`
    );
  }
}

for (const summary of summaries) {
  console.log(`[token-guard] ${summary}`);
}

for (const warning of warnings) {
  console.warn(`[token-guard] warning: ${warning}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[token-guard] blocked: ${failure}`);
  }
  process.exitCode = 1;
}

function readNonNegativeInteger(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return { ok: false, message: `${name} is missing` };
  }

  if (!/^(0|[1-9]\d*)$/.test(raw)) {
    return { ok: false, message: `${name} must be a non-negative integer` };
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    return { ok: false, message: `${name} must be a safe integer` };
  }

  return { ok: true, value };
}

function readPositiveInteger(name, fallback) {
  const raw = process.env[name];
  if ((raw === undefined || raw === "") && fallback !== undefined) {
    return { ok: true, value: fallback };
  }

  if (raw === undefined || raw === "") {
    return { ok: false, message: `${name} is missing` };
  }

  if (!/^[1-9]\d*$/.test(raw)) {
    return { ok: false, message: `${name} must be a positive integer` };
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    return { ok: false, message: `${name} must be a safe integer` };
  }

  return { ok: true, value };
}

function readUtcCutoffHour(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return { ok: true, value: fallback };
  }

  if (!/^(0|[1-9]\d*)$/.test(raw)) {
    return { ok: false, message: `${name} must be an integer from 0 through 23` };
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0 || value > 23) {
    return { ok: false, message: `${name} must be an integer from 0 through 23` };
  }

  return { ok: true, value };
}

function readNowUtc(name) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return { ok: true, value: new Date() };
  }

  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) {
    return { ok: false, message: `${name} must be a valid date-time` };
  }

  return { ok: true, value };
}

function formatUtcHour(hour) {
  return `${String(hour).padStart(2, "0")}:00 UTC`;
}
