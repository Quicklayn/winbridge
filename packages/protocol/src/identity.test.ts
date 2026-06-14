import { describe, expect, it } from "vitest";
import {
  assertRemoteActionAuthorized,
  consumePairingTicket,
  createDeviceIdentity,
  createPairingCodeSalt,
  createPairingTicket,
  createPairedDevice,
  DeviceIdentitySchema,
  hashPairingCode,
  PairedDeviceSchema,
  PairingTicketSchema,
  SELF_PAIRING_DEVICE_REJECTION_REASON
} from "./identity.js";

const secretBearingDisplayNames = [
  "Authorization: Bearer raw-display-token",
  "credential: raw-display-credential",
  "pairing code: raw-display-pairing-code",
  "diagnostics dump: raw-display-diagnostics",
  "screen content: raw-display-screen"
] as const;

describe("device identity", () => {
  it("creates schema-valid local device metadata", () => {
    const identity = createDeviceIdentity({
      displayName: "Host workstation",
      platform: "windows",
      deviceId: "dev_host_1"
    });

    expect(identity).toMatchObject({
      deviceId: "dev_host_1",
      platform: "windows",
      trustLevel: "local-dev"
    });
  });

  it("returns immutable local device identity snapshots", () => {
    const identity = createDeviceIdentity({
      displayName: "Host workstation",
      platform: "windows",
      deviceId: "dev_host_1",
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(Object.isFrozen(identity)).toBe(true);
    expect(() => {
      identity.deviceId = "dev_viewer_1";
    }).toThrow(TypeError);
    expect(() => {
      identity.displayName = "Viewer workstation";
    }).toThrow(TypeError);
    expect(JSON.parse(JSON.stringify(identity))).toStrictEqual({
      deviceId: "dev_host_1",
      displayName: "Host workstation",
      platform: "windows",
      trustLevel: "local-dev",
      createdAt: "2026-06-11T00:00:00.000Z"
    });
  });

  it("rejects malformed local device identifiers", () => {
    expect(() =>
      createDeviceIdentity({
        displayName: "Host workstation",
        platform: "windows",
        deviceId: "dev host 1"
      })
    ).toThrow();
    expect(() =>
      createDeviceIdentity({
        displayName: "Host workstation",
        platform: "windows",
        deviceId: "d".repeat(129)
      })
    ).toThrow();
  });

  it("rejects blank local device display names", () => {
    expect(() =>
      createDeviceIdentity({
        displayName: "   ",
        platform: "windows",
        deviceId: "dev_host_1"
      })
    ).toThrow("Display name must not be blank");
  });

  it("rejects untrimmed local device display names", () => {
    expect(() =>
      createDeviceIdentity({
        displayName: " Host workstation ",
        platform: "windows",
        deviceId: "dev_host_1"
      })
    ).toThrow("Display name must be trimmed");
  });

  it("rejects local device display names with ASCII control characters", () => {
    expect(() =>
      createDeviceIdentity({
        displayName: "Host\nworkstation",
        platform: "windows",
        deviceId: "dev_host_1"
      })
    ).toThrow("Display name must not contain ASCII control characters");
  });

  it("rejects local device display names with Unicode bidi or zero-width controls", () => {
    for (const displayName of ["Host\u202eworkstation", "Host\u200bworkstation", "Host\ufeffworkstation"]) {
      expect(() =>
        createDeviceIdentity({
          displayName,
          platform: "windows",
          deviceId: "dev_host_1"
        })
      ).toThrow("Display name must not contain Unicode bidi or zero-width formatting controls");
    }
  });

  it("rejects secret-bearing local device display names without exposing raw text", () => {
    for (const displayName of secretBearingDisplayNames) {
      try {
        createDeviceIdentity({
          displayName,
          platform: "windows",
          deviceId: "dev_host_1"
        });
        throw new Error("Expected secret-bearing display name to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("sensitive metadata");
        expect((error as Error).message).not.toContain("raw-display");
        expect((error as Error).message).not.toContain(displayName);
      }
    }
  });

  it("accepts safe non-secret local device display names", () => {
    expect(
      createDeviceIdentity({
        displayName: "Host workstation",
        platform: "windows",
        deviceId: "dev_host_1"
      }).displayName
    ).toBe("Host workstation");
  });

  it("rejects device identity records with unknown fixed fields", () => {
    expect(() =>
      DeviceIdentitySchema.parse({
        deviceId: "dev_host_1",
        displayName: "Host workstation",
        platform: "windows",
        trustLevel: "local-dev",
        createdAt: new Date().toISOString(),
        unknownFixedField: "must-fail"
      })
    ).toThrow();
  });
});

describe("pairing tickets", () => {
  it("hashes pairing codes with a per-ticket salt and does not retain the raw code", () => {
    const pairingCodeSalt = "salt:00112233445566778899aabbccddeeff";
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      pairingCodeSalt,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(ticket.pairingCodeSalt).toBe(pairingCodeSalt);
    expect(ticket.pairingCodeHash).toBe(hashPairingCode("123-456", pairingCodeSalt));
    expect(JSON.stringify(ticket)).not.toContain("123-456");
  });

  it("returns immutable pairing ticket snapshots", () => {
    const ticket = createPairingTicket({
      pairingId: "pair-demo",
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      pairingCodeSalt: "salt:00112233445566778899aabbccddeeff",
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(Object.isFrozen(ticket)).toBe(true);
    expect(() => {
      ticket.remainingUses = 10;
    }).toThrow(TypeError);
    expect(() => {
      ticket.pairingCodeHash = hashPairingCode("999-000", ticket.pairingCodeSalt);
    }).toThrow(TypeError);
    expect(JSON.parse(JSON.stringify(ticket))).toStrictEqual({
      pairingId: "pair-demo",
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCodeSalt: "salt:00112233445566778899aabbccddeeff",
      pairingCodeHash: hashPairingCode("123-456", "salt:00112233445566778899aabbccddeeff"),
      createdAt: "2026-06-11T00:00:00.000Z",
      expiresAt: "2026-06-11T00:05:00.000Z",
      remainingUses: 1
    });
    expect(JSON.stringify(ticket)).not.toContain("123-456");
    expect(JSON.stringify(ticket)).not.toContain("999-000");
  });

  it("rejects pairing records with malformed identifiers", () => {
    expect(() =>
      createPairingTicket({
        sessionId: "session demo",
        hostDeviceId: "dev_host_1",
        pairingCode: "123-456"
      })
    ).toThrow();
    expect(() =>
      createPairingTicket({
        sessionId: "session-demo",
        hostDeviceId: "dev_host_1",
        pairingCode: "123-456",
        pairingId: "p".repeat(129)
      })
    ).toThrow();

    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456"
    });

    expect(() =>
      createPairedDevice({
        ticket,
        viewerDeviceId: "viewer/1"
      })
    ).toThrow();
  });

  it("rejects pairing records with unknown fixed fields", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456"
    });
    const pair = createPairedDevice({
      ticket,
      viewerDeviceId: "dev_viewer_1"
    });

    expect(() =>
      PairingTicketSchema.parse({
        ...ticket,
        unknownFixedField: "must-fail"
      })
    ).toThrow();
    expect(() =>
      PairedDeviceSchema.parse({
        ...pair,
        unknownFixedField: "must-fail"
      })
    ).toThrow();
  });

  it("creates distinct salts and hashes for the same pairing code", () => {
    const first = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456"
    });
    const second = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456"
    });

    expect(createPairingCodeSalt()).toMatch(/^salt:[a-f0-9]{32}$/);
    expect(first.pairingCodeSalt).not.toBe(second.pairingCodeSalt);
    expect(first.pairingCodeHash).not.toBe(second.pairingCodeHash);
    expect(JSON.stringify([first, second])).not.toContain("123-456");
  });

  it("uses bounded pairing ticket factory defaults and valid overrides", () => {
    const defaultTicket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      now: new Date("2026-06-11T00:00:00.000Z")
    });
    const immediateExpiryTicket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 0,
      maxUses: 10,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(defaultTicket.expiresAt).toBe("2026-06-11T00:05:00.000Z");
    expect(defaultTicket.remainingUses).toBe(1);
    expect(immediateExpiryTicket.expiresAt).toBe("2026-06-11T00:00:00.000Z");
    expect(immediateExpiryTicket.remainingUses).toBe(10);
  });

  it("rejects malformed pairing ticket factory values before ticket creation", () => {
    for (const ttlMs of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648]) {
      expect(() =>
        createPairingTicket({
          sessionId: "session-demo",
          hostDeviceId: "dev_host_1",
          pairingCode: "123-456",
          ttlMs
        })
      ).toThrow("Pairing ticket TTL");
    }

    for (const maxUses of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 11]) {
      expect(() =>
        createPairingTicket({
          sessionId: "session-demo",
          hostDeviceId: "dev_host_1",
          pairingCode: "123-456",
          maxUses
        })
      ).toThrow("Pairing ticket max uses");
    }
  });

  it("rejects expired tickets", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 1000,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(() =>
      consumePairingTicket(ticket, "123-456", new Date("2026-06-11T00:00:01.001Z"))
    ).toThrow("expired");
  });

  it("prevents replay after remaining uses are consumed", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      maxUses: 1,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    const consumed = consumePairingTicket(
      ticket,
      "123-456",
      new Date("2026-06-11T00:00:00.500Z")
    );

    expect(consumed.remainingUses).toBe(0);
    expect(consumed.pairingCodeSalt).toBe(ticket.pairingCodeSalt);
    expect(consumed.pairingCodeHash).toBe(ticket.pairingCodeHash);
    expect(ticket.remainingUses).toBe(1);
    expect(Object.isFrozen(consumed)).toBe(true);
    expect(() => {
      consumed.remainingUses = 1;
    }).toThrow(TypeError);
    expect(() =>
      consumePairingTicket(consumed, "123-456", new Date("2026-06-11T00:00:00.600Z"))
    ).toThrow("no remaining uses");
  });

  it("rejects mismatched pairing codes with salted ticket hashes", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(() =>
      consumePairingTicket(ticket, "999-000", new Date("2026-06-11T00:00:00.500Z"))
    ).toThrow("does not match");
    expect(ticket.remainingUses).toBe(1);
    expect(JSON.stringify(ticket)).not.toContain("999-000");
  });

  it("rejects malformed stored pairing hashes before consuming tickets", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      now: new Date("2026-06-11T00:00:00.000Z")
    });
    const malformedTicket = {
      ...ticket,
      pairingCodeHash: `sha256:${"0".repeat(63)}`
    } as unknown as Parameters<typeof consumePairingTicket>[0];

    let thrown: unknown;
    try {
      consumePairingTicket(malformedTicket, "123-456", new Date("2026-06-11T00:00:00.500Z"));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).not.toContain("123-456");
    expect((thrown as Error).message).not.toContain(ticket.pairingCodeHash);
    expect(ticket.remainingUses).toBe(1);
  });

  it("binds paired-device records to the ticket validity window", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 1000,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(() =>
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_viewer_1",
        pairedAt: new Date("2026-06-10T23:59:59.999Z")
      })
    ).toThrow("before pairing ticket creation");
    expect(
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_viewer_1",
        pairedAt: new Date("2026-06-11T00:00:00.000Z")
      })
    ).toMatchObject({
      pairedAt: "2026-06-11T00:00:00.000Z"
    });
    expect(
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_viewer_1",
        pairedAt: new Date("2026-06-11T00:00:00.999Z")
      })
    ).toMatchObject({
      pairedAt: "2026-06-11T00:00:00.999Z"
    });
    expect(() =>
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_viewer_1",
        pairedAt: new Date("2026-06-11T00:00:01.000Z")
      })
    ).toThrow("before pairing ticket expiration");
  });

  it("does not create paired-device records from zero-TTL tickets", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 0,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    expect(() =>
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_viewer_1",
        pairedAt: new Date("2026-06-11T00:00:00.000Z")
      })
    ).toThrow("before pairing ticket expiration");
  });

  it("rejects paired-device records that reuse the host device id", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 1000,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    try {
      createPairedDevice({
        ticket,
        viewerDeviceId: "dev_host_1",
        pairedAt: new Date("2026-06-11T00:00:00.500Z")
      });
      throw new Error("Expected self-pairing device record to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain(SELF_PAIRING_DEVICE_REJECTION_REASON);
      expect((error as Error).message).not.toContain("dev_host_1");
    }
  });

  it("creates a pair relationship without granting remote action permission", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456",
      ttlMs: 1000,
      now: new Date("2026-06-11T00:00:00.000Z")
    });

    const pair = createPairedDevice({
      ticket,
      viewerDeviceId: "dev_viewer_1",
      pairedAt: new Date("2026-06-11T00:00:00.500Z")
    });

    expect(pair.hostDeviceId).toBe("dev_host_1");
    expect(pair.viewerDeviceId).toBe("dev_viewer_1");
    expect(Object.isFrozen(pair)).toBe(true);
    expect(() => {
      pair.hostDeviceId = "dev_other_1";
    }).toThrow(TypeError);
    expect(() => {
      pair.viewerDeviceId = "dev_host_1";
    }).toThrow(TypeError);
    expect(JSON.parse(JSON.stringify(pair))).toStrictEqual({
      pairingId: ticket.pairingId,
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      viewerDeviceId: "dev_viewer_1",
      pairedAt: "2026-06-11T00:00:00.500Z"
    });
    expect(() =>
      assertRemoteActionAuthorized({
        permission: "screen:view",
        grant: pair
      })
    ).toThrow();
  });

  it("allows remote action only with a consent-bound session grant", () => {
    expect(() =>
      assertRemoteActionAuthorized({
        permission: "screen:view",
        grant: {
          sessionId: "session-demo",
          hostPeerId: "host-1",
          viewerPeerId: "viewer-1",
          permissions: ["screen:view"],
          requiresHostApproval: true,
          visibleSessionRequired: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          auditId: "audit-demo"
        }
      })
    ).not.toThrow();
  });

  it("fails remote action authorization for secret-bearing consent grant identifiers", () => {
    const cases = [
      {
        name: "sessionId",
        unsafeValue: "token-raw-grant-authz",
        buildGrant: (value: string) => ({
          sessionId: value,
          hostPeerId: "host-1",
          viewerPeerId: "viewer-1",
          permissions: ["screen:view"],
          requiresHostApproval: true,
          visibleSessionRequired: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          auditId: "audit-demo"
        })
      },
      {
        name: "hostPeerId",
        unsafeValue: "credential-raw-grant-authz",
        buildGrant: (value: string) => ({
          sessionId: "session-demo",
          hostPeerId: value,
          viewerPeerId: "viewer-1",
          permissions: ["screen:view"],
          requiresHostApproval: true,
          visibleSessionRequired: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          auditId: "audit-demo"
        })
      },
      {
        name: "viewerPeerId",
        unsafeValue: "cookie-raw-grant-authz",
        buildGrant: (value: string) => ({
          sessionId: "session-demo",
          hostPeerId: "host-1",
          viewerPeerId: value,
          permissions: ["screen:view"],
          requiresHostApproval: true,
          visibleSessionRequired: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          auditId: "audit-demo"
        })
      },
      {
        name: "auditId",
        unsafeValue: "ssh-key-raw-grant-authz",
        buildGrant: (value: string) => ({
          sessionId: "session-demo",
          hostPeerId: "host-1",
          viewerPeerId: "viewer-1",
          permissions: ["screen:view"],
          requiresHostApproval: true,
          visibleSessionRequired: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          auditId: value
        })
      }
    ] as const;

    for (const { buildGrant, name, unsafeValue } of cases) {
      let thrown: unknown;

      try {
        assertRemoteActionAuthorized({
          permission: "screen:view",
          grant: buildGrant(unsafeValue)
        });
      } catch (error) {
        thrown = error;
      }

      expect(thrown, `${name}:${unsafeValue}`).toBeInstanceOf(Error);
      expect((thrown as Error).message, `${name}:${unsafeValue}`).toContain(
        "Session grant identifier"
      );
      expect((thrown as Error).message, `${name}:${unsafeValue}`).toContain(
        "sensitive metadata"
      );
      expect((thrown as Error).message, `${name}:${unsafeValue}`).not.toContain(unsafeValue);
      expect((thrown as Error).message, `${name}:${unsafeValue}`).not.toContain("raw-grant");
    }
  });
});
