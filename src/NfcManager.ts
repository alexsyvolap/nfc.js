import { createNfcError, isNDEFReaderSupported } from './helpers';
import {
  NDEFMessage,
  NDEFReadingEvent,
  NDEFRecord,
  NfcError,
  NfcException,
  NfcManagerOptions,
  NfcManagerRecordType,
} from './types';
import type { NDEFReader } from './global';

export class NfcManager {
  private abortController: AbortController | null = null;
  private reader: NDEFReader | null = null;
  private scanTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private options: Required<NfcManagerOptions>;

  constructor(options: NfcManagerOptions = {}) {
    this.options = {
      defaultTimeout: 30_000,
      onError: () => {},
      onTagDetected: () => {},
      ...options,
    };
  }

  /**
   * Starts scanning for NFC tags
   */
  public async scan(timeoutMs?: number): Promise<NDEFReadingEvent> {
    const timeout = timeoutMs ?? this.options.defaultTimeout;

    if (!isNDEFReaderSupported()) {
      const error = createNfcError.notSupported();
      this.options.onError(error);
      throw error;
    }

    if (this.isScanning()) {
      this.abort();
    }

    this.abortController = new AbortController();
    this.reader = new window.NDEFReader();

    return new Promise<NDEFReadingEvent>((resolve, reject) => {
      if (!this.reader || !this.abortController) {
        const error = createNfcError.readerNotStarted();
        this.options.onError(error);
        reject(error);
        return;
      }

      this.reader.onreading = (event: NDEFReadingEvent) => {
        try {
          this.options.onTagDetected(event.serialNumber);
          resolve(event);
        } catch (err) {
          const error = this.normalizeError(err);
          this.options.onError(error);
          reject(error);
        }
      };

      this.reader.onreadingerror = () => {
        const error = createNfcError.invalidTarget();
        this.options.onError(error);
        this.abort();
        reject(error);
      };

      // Setup timeout
      this.scanTimeoutId = setTimeout(() => {
        const error = createNfcError.timeout();
        this.options.onError(error);
        this.abort();
        reject(error);
      }, timeout);

      // Start scanning
      this.reader!.scan({ signal: this.abortController.signal }).catch(
        (err) => {
          const error = this.normalizeError(err);
          this.options.onError(error);
          reject(error);
        },
      );
    });
  }

  /**
   * Waits for the next NFC tag in an active scan session
   */
  public waitForNext(timeoutMs?: number): Promise<NDEFReadingEvent> {
    const timeout = timeoutMs ?? this.options.defaultTimeout;

    return new Promise<NDEFReadingEvent>((resolve, reject) => {
      if (!this.isScanning()) {
        reject(createNfcError.readerNotStarted());
        return;
      }

      const timer = setTimeout(() => {
        reject(createNfcError.timeout());
      }, timeout);

      const originalHandler = this.reader!.onreading;

      this.reader!.onreading = (event: NDEFReadingEvent) => {
        clearTimeout(timer);
        this.reader!.onreading = originalHandler;
        this.options.onTagDetected(event.serialNumber);
        resolve(event);
      };
    });
  }

  /**
   * Writes data to NFC tag
   */
  public async write(data: NDEFMessage): Promise<void> {
    if (!this.isScannerReady()) {
      const error = createNfcError.readerNotStarted();
      this.options.onError(error);
      throw error;
    }

    if (!data || !data.records || data.records.length === 0) {
      const error = createNfcError.noData();
      this.options.onError(error);
      throw error;
    }

    try {
      await this.reader?.write(data, {
        signal: this.abortController?.signal,
      });
    } catch (err) {
      const error = this.normalizeError(err);
      this.options.onError(error);
      throw error;
    }
  }

  /**
   * Makes NFC tag read-only
   */
  public async makeReadOnly(): Promise<void> {
    if (!this.isScannerReady()) {
      const error = createNfcError.readerNotStarted();
      this.options.onError(error);
      throw error;
    }

    if (!('makeReadOnly' in window.NDEFReader.prototype)) {
      const error = createNfcError.unsupportedOperation('makeReadOnly');
      this.options.onError(error);
      throw error;
    }

    try {
      await this.reader?.makeReadOnly({
        signal: this.abortController?.signal,
      });
    } catch (err) {
      const error = this.normalizeError(err);
      this.options.onError(error);
      throw error;
    }
  }

  /**
   * Convenient method for scan -> write -> abort workflow
   */
  public async scanAndWrite(
    data: NDEFMessage,
    timeoutMs?: number,
  ): Promise<void> {
    await this.scan(timeoutMs);
    await this.write(data);
    this.abort();
  }

  /**
   * Convenient method for scan -> read -> process workflow
   */
  public async scanAndRead<T>(
    processor: (event: NDEFReadingEvent) => T | Promise<T>,
    timeoutMs?: number,
  ): Promise<T> {
    const event = await this.scan(timeoutMs);
    const result = await processor(event);
    this.abort();
    return result;
  }

  /**
   * Scans for multiple tags in sequence
   */
  public async *scanMultiple(
    timeoutMs?: number,
  ): AsyncGenerator<NDEFReadingEvent> {
    const firstEvent = await this.scan(timeoutMs);
    yield firstEvent;

    while (this.isScanning()) {
      try {
        const event = await this.waitForNext(timeoutMs);
        yield event;
      } catch (error) {
        if (error instanceof NfcException && error.code === NfcError.TIMEOUT) {
          break;
        }
        throw error;
      }
    }
  }

  /**
   * Decodes a single NDEF record
   */
  public decodeRecordData(record: NDEFRecord): string {
    if (!record.data) {
      throw createNfcError.noData();
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
        throw createNfcError.unsupportedRecordType(record.recordType);
    }
  }

  /**
   * Aborts current operation
   */
  public abort(): void {
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
  }

  /**
   * Returns whether scanning is active
   */
  public isScanning(): boolean {
    return this.abortController !== null;
  }

  private isScannerReady(): boolean {
    return isNDEFReaderSupported() && this.reader !== null;
  }

  private normalizeError(err: unknown): NfcException {
    if (err instanceof NfcException) return err;
    if (err instanceof Error) {
      const errorMap: Record<string, () => NfcException> = {
        NotSupportedError: () => createNfcError.notSupported(err),
        SecurityError: () => createNfcError.permissionDenied(err),
        InvalidTargetError: () => createNfcError.invalidTarget(err),
        TimeoutError: () => createNfcError.timeout(err),
        AbortError: () => createNfcError.abort(err),
        SyntaxError: () => createNfcError.syntaxError(err),
        NetworkError: () => createNfcError.networkError(err),
      };

      return (
        errorMap[err.name]?.() ||
        new NfcException(err.message, NfcError.NETWORK_ERROR, err)
      );
    }

    if (typeof err === 'string') {
      return new NfcException(err, NfcError.NETWORK_ERROR);
    }

    return new NfcException('Unknown error', NfcError.NETWORK_ERROR);
  }
}
