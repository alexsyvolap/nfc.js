# nfc.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/alexsyvolap/nfc.js/blob/main/LICENSE.md)

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
import { NfcManager } from 'nfc.js';

const nfc = new NfcManager();
```

## Scanning NFC Tags

### Basic Scan

```js
try {
  const event = await nfc.scan(20_000); // optional timeout in milliseconds
  console.log('Tag read:', event);

  // Process records
  event.message.records.forEach(record => {
    console.log('Record type:', record.recordType);
    const decoded = nfc.decodeRecordData(record);
    console.log('Decoded data:', decoded);
  });
} catch (error) {
  console.error('NFC error:', error.message);
}
```

### Scan with Processing

```js
const result = await nfc.scanAndRead(async (event) => {
  console.log('Tag detected:', event.serialNumber);

  // Process the tag
  return event.message.records.map(record => {
    return nfc.decodeRecordData(record);
  });
}, 20_000);

console.log('Processed data:', result);
```

### Scan Multiple Tags

```js
try {
  for await (const event of nfc.scanMultiple(30_000)) {
    console.log('New tag:', event.serialNumber);

    // Process each tag
    const records = event.message.records;
    // ... handle records

    // Continue scanning for next tag
  }
} catch (error) {
  console.error('Scan error:', error);
}
```

## Writing Data to NFC Tag

### Write

```js
import { NfcManagerRecordType } from 'nfc.js';

const message: NDEFMessage = {
  records: [
    {
      recordType: NfcManagerRecordType.Text,
      data: 'Hello NFC!',
      lang: 'en',
    },
  ],
};

try {
  await nfc.scanAndWrite(message, 20_000);
  console.log('Data successfully written to NFC tag');
} catch (error) {
  console.error('Write error:', error.message);
}
```

### Manual Write Process

```js
import { NfcManagerRecordType } from 'nfc.js';

const message: NDEFMessage = {
  records: [
    {
      recordType: NfcManagerRecordType.Text,
      data: 'Hello NFC!',
      lang: 'en',
    },
  ],
};

try {
  // Start scanning
  const event = await nfc.scan(20_000);
  console.log('Tag detected, writing data...');

  // Write to the detected tag
  await nfc.write(message);
  console.log('Write successful');

  // Stop scanning
  nfc.abort();
} catch (error) {
  console.error('Write process error:', error);
}
```

## Making Tag Read-Only

```js
try {
  // Start scanning
  const event = await nfc.scan(20_000);
  console.log('Tag detected, making read-only...');

  // Make tag read-only
  await nfc.makeReadOnly();
  console.log('Tag is now read-only');

  // Stop scanning
  nfc.abort();
} catch (error) {
  console.error('Read-only process error:', error);
}
```

## Decode record (NDEFRecord) data

```js
try {
  // Start scanning
  const event = await nfc.scan(20_000);
  console.log('Tag detected, decoding data...');

  const records = event.message.records;

  for (const record of records) {
    try {
      const decoded = nfc.decodeRecordData(record);
      console.log('Decoded data:', decoded);
    } catch (err) {
      console.warn('Failed to decode record:', err);
    }
  }

  // Stop scanning
  nfc.abort();
} catch (error) {
  console.error('Decode process error:', error);
}
```

## Aborting the Current Operation

```js
// Abort the current scanning or writing operation
nfc.abort();
```

## API Methods

| Method             | Description                                      | Returns                          |
|--------------------|--------------------------------------------------|----------------------------------|
| scan()             | Scans for a single NFC tag                       | Promise<NDEFReadingEvent>        |
| scanAndWrite()     | Scans for a tag and writes data to it            | Promise<void>                    |
| scanAndRead()      | Scans for a tag and processes it with a function | Promise<T>                       |
| scanMultiple()     | Scans for multiple tags in sequence              | AsyncGenerator<NDEFReadingEvent> |
| write()            | Writes data to an already detected tag           | Promise<void>                    |
| makeReadOnly()     | Makes an already detected tag read-only          | Promise<void>                    |
| decodeRecordData() | Decodes NDEF record data to string               | string                           |
| abort()            | Aborts the current operation                     | void                             |
| isScanning()       | Returns whether scanning is active               | boolean                          |

## TODO

- [ ] Write tests
