export { NfcManager } from './NfcManager';
export {
  isNDEFReaderSupported,
  isSupported,
  checkNfcPermission,
} from './helpers';

export type {
  NfcManagerRecordType,
  NDEFMessage,
  NDEFReadingEvent,
  NDEFRecord,
  NfcManagerOptions,
  NfcError,
  NfcException,
} from './types';
