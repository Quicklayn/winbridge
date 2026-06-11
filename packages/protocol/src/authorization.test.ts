import { describe, expect, it } from "vitest";
import {
  activateSessionAuthorization,
  approveSessionAuthorization,
  assertSessionActionAuthorized,
  createPendingSessionAuthorization,
  denySessionAuthorization,
  expireSessionAuthorization,
  revokeSessionPermission,
  terminateSessionAuthorization
} from "./authorization.js";
import { createPairingTicket, createPairedDevice } from "./identity.js";

const baseTime = new Date("2026-06-11T00:00:00.000Z");

function pending() {
  return createPendingSessionAuthorization({
    sessionId: "session-demo",
    hostPeerId: "host-1",
    viewerPeerId: "viewer-1",
    requestedPermissions: ["screen:view", "input:pointer"],
    now: baseTime
  });
}

describe("session authorization state machine", () => {
  it("does not authorize actions while pending", () => {
    expect(() =>
      assertSessionActionAuthorized({
        authorization: pending(),
        permission: "screen:view",
        now: baseTime
      })
    ).toThrow("not active");
  });

  it("denies actions after host denial", () => {
    const denied = denySessionAuthorization(pending(), {
      reason: "Host denied",
      now: baseTime
    });

    expect(denied.status).toBe("denied");
    expect(() =>
      assertSessionActionAuthorized({
        authorization: denied,
        permission: "screen:view",
        now: baseTime
      })
    ).toThrow("denied");
  });

  it("requires visible host session state before activation", () => {
    const approved = approveSessionAuthorization(pending(), {
      grantedPermissions: ["screen:view"],
      now: baseTime
    });

    expect(() =>
      activateSessionAuthorization(approved, {
        // @ts-expect-error Runtime guard matters for external input.
        visibleToHost: false,
        now: baseTime
      })
    ).toThrow("visible host session");
  });

  it("authorizes granted actions only when active and visible", () => {
    const active = activateSessionAuthorization(
      approveSessionAuthorization(pending(), {
        grantedPermissions: ["screen:view"],
        now: baseTime
      }),
      {
        visibleToHost: true,
        now: baseTime
      }
    );

    expect(
      assertSessionActionAuthorized({
        authorization: active,
        permission: "screen:view",
        now: baseTime
      }).status
    ).toBe("active");
    expect(() =>
      assertSessionActionAuthorized({
        authorization: active,
        permission: "input:keyboard",
        now: baseTime
      })
    ).toThrow("requested permission");
  });

  it("denies revoked permissions immediately", () => {
    const active = activateSessionAuthorization(
      approveSessionAuthorization(pending(), {
        grantedPermissions: ["screen:view", "input:pointer"],
        now: baseTime
      }),
      { visibleToHost: true, now: baseTime }
    );
    const revoked = revokeSessionPermission(active, {
      permission: "screen:view",
      now: baseTime
    });

    expect(() =>
      assertSessionActionAuthorized({
        authorization: revoked,
        permission: "screen:view",
        now: baseTime
      })
    ).toThrow("requested permission");
    expect(
      assertSessionActionAuthorized({
        authorization: revoked,
        permission: "input:pointer",
        now: baseTime
      }).status
    ).toBe("active");
  });

  it("denies all actions after termination", () => {
    const active = activateSessionAuthorization(
      approveSessionAuthorization(pending(), {
        grantedPermissions: ["screen:view"],
        now: baseTime
      }),
      { visibleToHost: true, now: baseTime }
    );
    const terminated = terminateSessionAuthorization(active, {
      reason: "Host disconnected",
      now: baseTime
    });

    expect(() =>
      assertSessionActionAuthorized({
        authorization: terminated,
        permission: "screen:view",
        now: baseTime
      })
    ).toThrow("terminated");
  });

  it("expires active authorizations fail closed", () => {
    const soon = createPendingSessionAuthorization({
      sessionId: "session-demo",
      hostPeerId: "host-1",
      viewerPeerId: "viewer-1",
      requestedPermissions: ["screen:view"],
      ttlMs: 1000,
      now: baseTime
    });
    const active = activateSessionAuthorization(
      approveSessionAuthorization(soon, {
        grantedPermissions: ["screen:view"],
        now: baseTime
      }),
      { visibleToHost: true, now: baseTime }
    );
    const afterExpiry = new Date("2026-06-11T00:00:01.001Z");

    expect(expireSessionAuthorization(active, afterExpiry).status).toBe("expired");
    expect(() =>
      assertSessionActionAuthorized({
        authorization: active,
        permission: "screen:view",
        now: afterExpiry
      })
    ).toThrow("expired");
  });

  it("does not treat pairing as active session authorization", () => {
    const ticket = createPairingTicket({
      sessionId: "session-demo",
      hostDeviceId: "dev_host_1",
      pairingCode: "123-456"
    });
    const paired = createPairedDevice({
      ticket,
      viewerDeviceId: "dev_viewer_1"
    });

    expect(() =>
      assertSessionActionAuthorized({
        authorization: paired,
        permission: "screen:view",
        now: baseTime
      })
    ).toThrow();
  });
});
