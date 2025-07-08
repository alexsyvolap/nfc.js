import { EventEmitter } from 'events';
import { isNDEFReaderSupported } from './helpers';
import {
  NDEFMessage,
  NDEFReadingEvent,
  NDEFRecord,
  NfcEvents,
  NfcManagerRecordType,
} from './types';
import type { NDEFReader } from './global';

export class NfcManager extends EventEmitter {
  private abortController: AbortController | null = null;
  private reader: NDEFReader | null = null;
  private scanTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public on<K extends keyof NfcEvents>(event: K, listener: NfcEvents[K]): this {
    return super.on(event, listener);
  }

  public once<K extends keyof NfcEvents>(
    event: K,
    listener: NfcEvents[K],
  ): this {
    return super.once(event, listener);
  }

  public off<K extends keyof NfcEvents>(
    event: K,
    listener: NfcEvents[K],
  ): this {
    return super.off(event, listener);
  }

  /**
   * Starts scanning for NFC tags and resolves with the first reading event.
   * Rejects on timeout or read error.
   */
  public async scan(scanTimeoutMs = 30000): Promise<void> {
    if (!isNDEFReaderSupported()) {
      this.emit('error', new Error('NDEFReader not supported'));
      return;
    }

    if (this.isScanning()) {
      this.abort();
    }

    this.abortController = new AbortController();
    this.reader = new window.NDEFReader();

    try {
      await this.reader.scan({ signal: this.abortController.signal });

      this.reader.onreading = (event: NDEFReadingEvent) =>
        this.emit('readSuccess', event);

      this.reader.onreadingerror = () => {
        this.emit('error', new Error('Read error occurred'));
        this.abort();
      };

      this.scanTimeoutId = setTimeout(() => {
        this.abort();
        this.emit('timeout');
      }, scanTimeoutMs);

      this.emit('scanStarted');
    } catch (err: unknown) {
      this.emit('error', this.normalizeError(err));
    }
  }

  /**
   * Writes data to NFC tag.
   * Throws if scanner not ready or write fails.
   */
  public async write(data: NDEFMessage): Promise<void> {
    if (!this.isScannerReady()) {
      return;
    }
    if (!data) {
      const error = new Error('No data to write');
      this.emit('error', error);
      throw error;
    }

    try {
      await this.reader?.write(data, {
        signal: this.abortController?.signal,
      });
      this.emit('writeSuccess');
    } catch (err: unknown) {
      this.emit('error', this.normalizeError(err));
    }
  }

  /**
   * Makes NFC tag read-only.
   * Throws if scanner not ready or operation unsupported or fails.
   */
  public async makeReadOnly(): Promise<void> {
    if (!this.isScannerReady()) {
      return;
    }
    if (!('makeReadOnly' in window.NDEFReader.prototype)) {
      const error = new Error(
        'This browser does not support making tags read-only',
      );
      this.emit('error', error);
      throw error;
    }

    try {
      await this.reader?.makeReadOnly({
        signal: this.abortController?.signal,
      });
      this.emit('readOnlySuccess');
    } catch (err: unknown) {
      this.emit('error', this.normalizeError(err));
    }
  }

  /**
   * Decodes a single NDEF record based on its recordType.
   * Supports all NfcManagerRecordType values.
   */
  public decodeRecordData(record: NDEFRecord): string {
    if (!record.data) {
      throw new Error('Record has no data');
    }

    const encoding = record.encoding || 'utf-8';
    const decoder = new TextDecoder(encoding);

    switch (record.recordType) {
      case NfcManagerRecordType.Text:
      case NfcManagerRecordType.Mime:
      case NfcManagerRecordType.SmartPoster:
      case NfcManagerRecordType.AbsoluteUrl:
      case NfcManagerRecordType.Url:
        if (record.data instanceof DataView) {
          return decoder.decode(record.data);
        }
        return record.data;

      case NfcManagerRecordType.Unknown:
      case NfcManagerRecordType.Empty:
        return '';

      default:
        throw new Error(`Unsupported record type: ${record.recordType}`);
    }
  }

  /**
   * Aborts current scanning or writing operation.
   */
  public abort() {
    this.abortController?.abort();
    this.abortController = null;

    if (this.reader) {
      this.reader.onreading = null;
      this.reader.onreadingerror = null;
      this.reader = null;
    }

    if (this.scanTimeoutId) {
      clearTimeout(this.scanTimeoutId);
      this.scanTimeoutId = null;
    }

    this.emit('abort');
  }

  /**
   * Returns whether scanning is active.
   */
  public isScanning(): boolean {
    return this.abortController !== null;
  }

  private isScannerReady(): boolean {
    if (!isNDEFReaderSupported()) {
      this.emit('error', new Error('NDEFReader not supported'));
      return false;
    }
    if (!this.reader) {
      this.emit('error', new Error('Reader not started'));
      return false;
    }

    return true;
  }

  private normalizeError(err: unknown): Error {
    if (err instanceof Error) return err;
    if (typeof err === 'string') return new Error(err);
    return new Error('Unknown error');
  }
}
