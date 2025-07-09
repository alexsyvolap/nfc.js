## v0.2.0

- removed EventEmitter and all event-based API (`scanStarted`, `readSuccess`, etc.)
- fully migrated to Promise-based API (`scan`, `scanAndWrite`, `scanAndRead`, `scanMultiple`, etc.)
- added error normalization with `NfcException` and `NfcError` enums
- added `NfcManagerOptions` for global onError/onTagDetected handlers
- added helpers: `isSupported`, `checkNfcPermission`
- updated README.md with new usage examples
- removed dependency on `events` package
- cleaned up types and internal structure

## v0.1.3
- remove intermediately call `this.abort();` after send `readSuccess` event
- added `this.abort();` to `onreadingerror`
- update README.md

## v0.1.2

- update license link

## v0.1.1

- added LICENSE.md

## v0.1.0

- first minor release with basic functionality

## v0.0.7

- remove `reading` event
- moved `reading` to `readSuccess`
- added `scanStarted` event

## v0.0.6

- add `decodeRecordData` method for decoding NFC data after scan

## v0.0.5

- move NDEF interfaces to types/NDEF
- declare window type

## v0.0.4

- added a repository link to package.json