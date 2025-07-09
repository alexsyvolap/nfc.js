import { NfcError } from './NfcError';

export class NfcException extends Error {
  constructor(
    message: string,
    public code: NfcError,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'NfcException';
  }
}
