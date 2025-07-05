# nfc.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/MIT)

A lightweight JavaScript (TypeScript-ready) helper for working
with [Web NFC](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API) in modern browsers.

Easily scan, write, and lock NFC tags using a minimal API with fallback handling and timeouts.

## Compatibility

### ✅ Works on:

- Chrome for Android v89+ (v100+ for read-only support)

### 🚫 Not supported on:

- iOS
- Desktop browsers

## Installation

```bash
npm install nfc.js
```

Or via CDN:

```html

<script src="https://unpkg.com/nfc.js"></script>
```

## Quick Start

```js
const nfc = new NfcManager();
```

## Scanning NFC Tags

```js
// Listen for the reading event
nfc.on('readSuccess', (event: NDEFReadingEvent) => {
    console.log('Tag read:', event);

    // Example: iterate through records on the tag
    event.message.records.forEach(record => {
        console.log('Record type:', record.recordType);
        // Process record content depending on the type
    });
});

// Listen for start scanning
nfc.on('scanStarted', () => {
    console.log('Scan started');
});

// Listen for errors during reading
nfc.on('error', (error) => {
    console.error('NFC error:', error.message);
});

// Listen for scan timeout
nfc.on('timeout', () => {
    console.warn('NFC scan timed out');
});

// Listen for scan abort
nfc.on('abort', () => {
    console.log('NFC scan aborted');
});

// Start scanning
nfc.scan(20000); // optional scan timeout in milliseconds
```

## Writing Data to NFC Tag

```js
const message: NDEFMessage = {
    records: [
        {
            recordType: NfcManagerRecordType.Text,
            data: 'Hello NFC!',
            lang: 'en',
        },
    ],
};

nfc.on('writeSuccess', () => {
    console.log('Data successfully written to NFC tag');
});

nfc.write(message).catch((err) => {
    console.error('Write failed:', err.message);
});
```

## Making Tag Read-Only

```js
nfc.on('readOnlySuccess', () => {
    console.log('Tag is now read-only');
});

nfc.makeReadOnly().catch((err) => {
    console.error('Failed to make tag read-only:', err.message);
});
```

## Decode record (NDEFRecord) data

```js
nfc.on('readSuccess', (event: NDEFReadingEvent) => {
    const records = event.message.records;

    for (const record of records) {
        try {
            const decoded = nfc.decodeRecordData(record);
            console.log('Decoded data:', decoded);
        } catch (err) {
            console.warn('Failed to decode record:', err);
        }
    }
});

await nfc.scan();
```

## Aborting the Current Operation

```js
// Abort the current scanning or writing operation
nfc.abort();
```

## Full List of Events

| Envet           | Description                                   | Argument         |
|-----------------|-----------------------------------------------|------------------|
| scanStarted     | Fired when scanning is started                | -                |
| readSuccess     | Fired when a tag is successfully read         | NDEFReadingEvent |
| writeSuccess    | Fired when writing operation succeeded        | -                |
| readOnlySuccess | Fired when tag has been locked as read-only   | -                |
| error           | Fired on any error during scanning or writing | Error            |
| timeout         | Fired when scanning times out                 | -                |
| abort           | Fired when operation is aborted               | -                |

## TODO

- [ ] Write tests
