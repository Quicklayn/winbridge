import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";
import type { HostDecision, HostDecisionProvider, HostDecisionProviderRequest } from "./runtime.js";

export type HostConsentPromptStreams = {
  input?: Readable;
  output?: Writable;
};

export function createInteractiveHostDecisionProvider(
  streams: HostConsentPromptStreams = {}
): HostDecisionProvider {
  return (request) => promptForHostConsentDecision(request, streams);
}

export async function promptForHostConsentDecision(
  request: HostDecisionProviderRequest,
  streams: HostConsentPromptStreams = {}
): Promise<HostDecision> {
  const input = streams.input ?? process.stdin;
  const output = streams.output ?? process.stdout;
  const readline = createInterface({ input, output });
  const abortController = new AbortController();
  const abortPrompt = () => abortController.abort();

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
    readline.close();
  }
}

function formatHostConsentPrompt(request: HostDecisionProviderRequest): string {
  const permissions = request.requestedPermissions.length > 0
    ? request.requestedPermissions.join(",")
    : "none";

  return [
    "[winbridge-agent] Host consent request",
    `[winbridge-agent] Requested permissions (${request.requestedPermissionCount}): ${permissions}`,
    "[winbridge-agent] Type approve or deny: "
  ].join("\n");
}

function parseHostConsentPromptAnswer(answer: string): HostDecision {
  if (answer === "approve" || answer === "deny") {
    return answer;
  }

  return "none";
}
