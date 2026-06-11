import { randomInt, randomUUID } from "node:crypto";
import { z } from "zod";

export const SessionRoleSchema = z.enum(["host", "viewer"]);
export type SessionRole = z.infer<typeof SessionRoleSchema>;

export const PermissionSchema = z.enum([
  "screen:view",
  "input:pointer",
  "input:keyboard",
  "clipboard:read",
  "clipboard:write",
  "file-transfer"
]);
export type Permission = z.infer<typeof PermissionSchema>;

export const SessionGrantSchema = z.object({
  sessionId: z.string().min(3),
  hostPeerId: z.string().min(3),
  viewerPeerId: z.string().min(3),
  permissions: z.array(PermissionSchema).max(16),
  requiresHostApproval: z.literal(true),
  visibleSessionRequired: z.literal(true),
  expiresAt: z.string().datetime(),
  auditId: z.string().min(3)
});
export type SessionGrant = z.infer<typeof SessionGrantSchema>;

export const PairingCodeSchema = z.string().regex(/^\d{3}-\d{3}$/);

export function createPairingCode(): string {
  const left = randomInt(0, 1000).toString().padStart(3, "0");
  const right = randomInt(0, 1000).toString().padStart(3, "0");
  return `${left}-${right}`;
}

export function createAuditId(): string {
  return `audit_${randomUUID()}`;
}

export function isGrantExpired(grant: SessionGrant, now = new Date()): boolean {
  return Date.parse(grant.expiresAt) <= now.getTime();
}

export function assertConsentBoundGrant(grant: SessionGrant, now = new Date()): SessionGrant {
  const parsed = SessionGrantSchema.parse(grant);

  if (isGrantExpired(parsed, now)) {
    throw new Error("Session grant is expired");
  }

  return parsed;
}
