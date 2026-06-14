import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";
import {
  DeviceDisplayNameSchema,
  hasSecretBearingAuditMetadata,
  hasSecretBearingProtocolIdentifierMetadata,
  MAX_PERMISSION_COUNT,
  PeerIdSchema,
  PermissionSchema
} from "@winbridge/protocol";
import {
  DEFAULT_HOST_CONSENT_TIMEOUT_MS,
  type HostDecision,
  type HostDecisionProvider,
  type HostDecisionProviderRequest
} from "./runtime.js";
import { assertAgentShellPositiveSchedulerDelayMs } from "./scheduler-delay.js";

const INVALID_PROMPT_METADATA = "invalid";
const UNAVAILABLE_PROMPT_METADATA = "unavailable";

export type HostConsentPromptStreams = {
  input?: Readable;
  output?: Writable;
};

export type HostConsentPromptOptions = HostConsentPromptStreams & {
  timeoutMs?: number;
};

export function createInteractiveHostDecisionProvider(
  options: HostConsentPromptOptions = {}
): HostDecisionProvider {
  if (options.timeoutMs !== undefined) {
    assertAgentShellPositiveSchedulerDelayMs(options.timeoutMs);
  }

  return (request) => promptForHostConsentDecision(request, options);
}

export async function promptForHostConsentDecision(
  request: HostDecisionProviderRequest,
  options: HostConsentPromptOptions = {}
): Promise<HostDecision> {
  if (options.timeoutMs !== undefined) {
    assertAgentShellPositiveSchedulerDelayMs(options.timeoutMs);
  }

  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const readline = createInterface({ input, output });
  const abortController = new AbortController();
  const abortPrompt = () => abortController.abort();
  const timeout = setTimeout(
    abortPrompt,
    options.timeoutMs ?? DEFAULT_HOST_CONSENT_TIMEOUT_MS
  );

  try {
    input.once("close", abortPrompt);
    input.once("end", abortPrompt);
    input.once("error", abortPrompt);

    const answer = await readline.question(formatHostConsentPrompt(request), {
      signal: abortController.signal
    });
    return parseHostConsentPromptAnswer(answer);
  } catch {
    return "none";
  } finally {
    input.off("close", abortPrompt);
    input.off("end", abortPrompt);
    input.off("error", abortPrompt);
    clearTimeout(timeout);
    readline.close();
  }
}

function formatHostConsentPrompt(request: HostDecisionProviderRequest): string {
  const permissions = formatPromptPermissions(request.requestedPermissions);

  return [
    "[winbridge-agent] Host consent request",
    `[winbridge-agent] Viewer peer: ${formatRequiredPeerId(request.viewerPeerId)}`,
    `[winbridge-agent] Viewer display name: ${formatOptionalDisplayName(request.viewerDisplayName)}`,
    `[winbridge-agent] Requested permissions (${permissions.count}): ${permissions.text}`,
    `[winbridge-agent] Request reason: ${formatOptionalRequestReason(request.requestReason)}`,
    "[winbridge-agent] Type approve or deny: "
  ].join("\n");
}

function formatRequiredPeerId(value: unknown): string {
  if (typeof value !== "string") {
    return INVALID_PROMPT_METADATA;
  }

  const parsed = PeerIdSchema.safeParse(value);
  if (!parsed.success || hasSecretBearingProtocolIdentifierMetadata(parsed.data)) {
    return INVALID_PROMPT_METADATA;
  }

  return parsed.data;
}

function formatOptionalDisplayName(value: unknown): string {
  if (value === undefined) {
    return UNAVAILABLE_PROMPT_METADATA;
  }

  const parsed = DeviceDisplayNameSchema.safeParse(value);
  return parsed.success ? parsed.data : UNAVAILABLE_PROMPT_METADATA;
}

function formatOptionalRequestReason(value: unknown): string {
  if (value === undefined || typeof value !== "string") {
    return UNAVAILABLE_PROMPT_METADATA;
  }

  if (
    value.trim().length === 0 ||
    value !== value.trim() ||
    value.length > 240 ||
    hasAsciiControlCharacter(value) ||
    hasUnsafeFormatCharacter(value) ||
    hasSecretBearingAuditMetadata(value, { includeKeyAssignments: false })
  ) {
    return UNAVAILABLE_PROMPT_METADATA;
  }

  return value;
}

function formatPromptPermissions(value: unknown): { count: number; text: string } {
  if (!Array.isArray(value) || value.length > MAX_PERMISSION_COUNT) {
    return { count: 0, text: INVALID_PROMPT_METADATA };
  }

  if (value.length === 0) {
    return { count: 0, text: "none" };
  }

  return {
    count: value.length,
    text: value.map(formatPromptPermission).join(",")
  };
}

function formatPromptPermission(value: unknown): string {
  const parsed = PermissionSchema.safeParse(value);
  return parsed.success ? parsed.data : INVALID_PROMPT_METADATA;
}

function hasAsciiControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) {
      return true;
    }
  }

  return false;
}

function hasUnsafeFormatCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (
      codePoint === 0x061c ||
      codePoint === 0x200b ||
      codePoint === 0x200c ||
      codePoint === 0x200d ||
      codePoint === 0x200e ||
      codePoint === 0x200f ||
      codePoint === 0x2060 ||
      codePoint === 0xfeff ||
      (codePoint !== undefined && codePoint >= 0x202a && codePoint <= 0x202e) ||
      (codePoint !== undefined && codePoint >= 0x2066 && codePoint <= 0x2069)
    ) {
      return true;
    }
  }

  return false;
}

function parseHostConsentPromptAnswer(answer: string): HostDecision {
  if (answer === "approve" || answer === "deny") {
    return answer;
  }

  return "none";
}
