import { NDEFReadingEvent } from '../global';

export type NfcEvents = {
  reading: (event: NDEFReadingEvent) => void;
  error: (error: Error) => void;
  abort: () => void;
  timeout: () => void;
  writeSuccess: () => void;
  readSuccess: (message: string) => void;
  readOnlySuccess: () => void;
};
