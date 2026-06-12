## ADDED Requirements

### Requirement: Signal payload JSON compatibility
The relay and agents SHALL accept only JSON-compatible object values in `signal.payload` before parsing, encoding, forwarding, sending, receiving, or treating the payload as trusted remote-assistance signaling metadata. `signal.payload` MUST reject values that cannot be represented faithfully in JSON, including functions, symbols, bigint, `undefined`, `NaN`, `Infinity`, `-Infinity`, cyclic values, own symbol-keyed properties, own non-enumerable properties, accessor properties, sparse arrays, non-index array properties, and inherited `toJSON` hooks that would change encoded output.

#### Scenario: JSON-compatible signal payload is accepted
- **WHEN** a peer sends a `signal` message whose payload contains strings, finite numbers, booleans, null, arrays, and nested plain objects with a valid top-level `authorizationId`
- **THEN** the protocol schema accepts the payload if all other signal safety checks pass

#### Scenario: Non-JSON signal payload is rejected
- **WHEN** a peer sends a `signal` message whose payload contains a function, symbol, bigint, `undefined`, `NaN`, `Infinity`, `-Infinity`, cyclic value, own symbol-keyed property, own non-enumerable property, accessor property, sparse array, non-index array property, or inherited `toJSON` hook that would change encoded output
- **THEN** the protocol schema rejects the message before forwarding, encoding, sending, receiving, or treating the payload as trusted remote-assistance signaling metadata

#### Scenario: Existing signal safety checks remain enforced
- **WHEN** a `signal` payload is JSON-compatible but omits a valid top-level `authorizationId`, is empty, oversized, or contains sensitive remote-assistance content keys
- **THEN** the relay and agents continue to reject the signal before forwarding or treating it as trusted remote-assistance data
