import { NDEFMessage } from './NDEFMessage';

export interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber: string;
}
