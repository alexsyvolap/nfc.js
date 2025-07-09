import { NfcError, NfcException } from './types';

export function isNDEFReaderSupported(): boolean {
  const supported = 'NDEFReader' in window;
  if (!supported) {
    console.warn('NDEFReader is not supported in this browser');
  }
  return supported;
}

export function isSupported(): boolean {
  return isNDEFReaderSupported();
}

export async function checkNfcPermission(): Promise<PermissionState> {
  try {
    const permission = await navigator.permissions.query({
      name: 'nfc' as any,
    });
    return permission.state;
  } catch {
    return 'denied';
  }
}

export const createNfcError = {
  notSupported: (cause?: Error) =>
    new NfcException(
      'NDEFReader not supported in this browser',
      NfcError.NOT_SUPPORTED,
      cause,
    ),

  permissionDenied: (cause?: Error) =>
    new NfcException(
      'NFC permission denied',
      NfcError.PERMISSION_DENIED,
      cause,
    ),

  invalidTarget: (cause?: Error) =>
    new NfcException('Invalid NFC target', NfcError.INVALID_TARGET, cause),

  timeout: (cause?: Error) =>
    new NfcException('NFC operation timeout', NfcError.TIMEOUT, cause),

  abort: (cause?: Error) =>
    new NfcException('NFC operation aborted', NfcError.ABORT, cause),

  syntaxError: (cause?: Error) =>
    new NfcException('Invalid NFC data format', NfcError.SYNTAX_ERROR, cause),

  networkError: (cause?: Error) =>
    new NfcException(
      'Network error during NFC operation',
      NfcError.NETWORK_ERROR,
      cause,
    ),

  noData: (cause?: Error) =>
    new NfcException('No data to write', NfcError.NO_DATA, cause),

  readerNotStarted: (cause?: Error) =>
    new NfcException('Reader not started', NfcError.READER_NOT_STARTED, cause),

  unsupportedOperation: (operation: string, cause?: Error) =>
    new NfcException(
      `Operation '${operation}' not supported`,
      NfcError.UNSUPPORTED_OPERATION,
      cause,
    ),

  unsupportedRecordType: (recordType: string, cause?: Error) =>
    new NfcException(
      `Unsupported record type: ${recordType}`,
      NfcError.UNSUPPORTED_RECORD_TYPE,
      cause,
    ),
};
