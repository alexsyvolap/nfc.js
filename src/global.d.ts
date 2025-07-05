import { NfcManagerRecordType } from './types';

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber: string;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFRecord {
  recordType: string | NfcManagerRecordType;
  mediaType?: string | null;
  id?: string | null;
  data?: string | DataView;
  encoding?: string | null;
  lang?: string | null;
}

declare class NDEFReader {
  constructor();

  scan(options?: { signal?: AbortSignal }): Promise<void>;

  write(data: NDEFMessage, options?: { signal?: AbortSignal }): Promise<void>;

  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;

  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}
