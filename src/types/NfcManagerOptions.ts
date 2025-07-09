import { NfcException } from './exceptions';

export interface NfcManagerOptions {
  defaultTimeout?: number;
  onError?: (error: NfcException) => void;
  onTagDetected?: (serialNumber: string) => void;
}
