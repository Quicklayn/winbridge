## 1. Type Contract

- [x] 1.1 Mark returned `DeviceIdentity` snapshots read-only at the exported type level.
- [x] 1.2 Mark returned `PairingTicket` snapshots read-only at the exported type level.
- [x] 1.3 Mark returned `PairedDevice` snapshots read-only at the exported type level.
- [x] 1.4 Keep schema input construction, relay audit construction, and local validation builders mutable-friendly.

## 2. Tests

- [x] 2.1 Update identity immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.2 Update pairing ticket immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.3 Update paired-device immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.4 Run focused identity tests.

## 3. Verification

- [x] 3.1 Review the identity type-only change for consent boundary, pairing replay, paired-device binding, relay registration, host visibility, grant authorization, audit evidence, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
