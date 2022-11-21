import { PerformanceLogger } from '../logger/Logger';

export default class DevDataCollector {
  private static currentField = '';

  private static currentByteCount = 0;

  private static lastByteCountBegin = -1;

  public static addBytesReceived(b: number): void {
    const now = Date.now();

    if (this.lastByteCountBegin === -1) {
      this.lastByteCountBegin = now;
    }

    if (now - this.lastByteCountBegin > 60) {
      PerformanceLogger.debug('BPS:', this.currentByteCount);

      this.currentByteCount = 0;
      this.lastByteCountBegin = now;
    }

    this.currentByteCount += b;
  }

  public static getCurrentField(): string {
    return DevDataCollector.currentField;
  }

  public static setCurrentField(fieldHash: string): void {
    DevDataCollector.currentField = fieldHash;
  }
}
