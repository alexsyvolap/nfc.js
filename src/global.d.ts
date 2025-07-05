import { NDEFMessage, NDEFReadingEvent } from './types';

declare class NDEFReader {
  constructor();

  scan(options?: { signal?: AbortSignal }): Promise<void>;

  write(data: NDEFMessage, options?: { signal?: AbortSignal }): Promise<void>;

  makeReadOnly(options?: { signal?: AbortSignal }): Promise<void>;

  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    NDEFReader: typeof NDEFReader;
  }
}
