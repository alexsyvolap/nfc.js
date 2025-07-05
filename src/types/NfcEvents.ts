import { NDEFReadingEvent } from './NDEF';

export type NfcEvents = {
  scanStarted: () => void;
  error: (error: Error) => void;
  abort: () => void;
  timeout: () => void;
  writeSuccess: () => void;
  readSuccess: (event: NDEFReadingEvent) => void;
  readOnlySuccess: () => void;
};
