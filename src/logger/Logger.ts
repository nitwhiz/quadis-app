/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

export const enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

class Logger {
  private readonly tag: string;

  constructor(tag = '???') {
    this.tag = tag.toUpperCase();
  }

  private getFullPrefix(prefix = ''): string {
    return `[${import.meta.env.MODE.toUpperCase()}]${prefix}[${this.tag}]`;
  }

  private writeInfo(prefix: string, ...args: any[]): void {
    console.info(this.getFullPrefix(prefix), ...args);
  }

  private writeDebug(prefix: string, ...args: any[]): void {
    console.debug(this.getFullPrefix(prefix), ...args);
  }

  private writeWarning(...args: any[]): void {
    console.error(this.getFullPrefix(), ...args);
  }

  private writeError(...args: any[]): void {
    console.error(this.getFullPrefix(), ...args);
  }

  private static levelToString(l: LogLevel): string {
    return `[${l}]`;
  }

  public debug(...args: any[]): void {
    this.writeDebug(Logger.levelToString(LogLevel.DEBUG), ...args);
  }

  public info(...args: any[]): void {
    this.writeInfo(Logger.levelToString(LogLevel.INFO), ...args);
  }

  public warn(...args: any[]): void {
    this.writeWarning(Logger.levelToString(LogLevel.WARNING), ...args);
  }

  public error(...args: any[]): void {
    this.writeError(Logger.levelToString(LogLevel.ERROR), ...args);
  }
}

export const DefaultLogger = new Logger('default');
export const PerformanceLogger = new Logger('perf');
export const GameLogger = new Logger('game');
export const InputLogger = new Logger('input');
export const RoomLogger = new Logger('room');
