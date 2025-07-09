import { NfcManagerRecordType } from '../NfcManagerRecordType';

export interface NDEFRecord {
  recordType: NfcManagerRecordType;
  mediaType?: string | null;
  id?: string | null;
  data?: string | DataView;
  encoding?: string | null;
  lang?: string | null;
}
