export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export class Logger {
  private levelOrder: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };
  private level: LogLevel;
  private sink: (level: LogLevel, msg: string, ...args: any[]) => void;

  constructor(level: LogLevel = 'info', sink?: (level: LogLevel, msg: string, ...args: any[]) => void) {
    this.level = level;
    this.sink = sink || ((l, m, ...a) => console.log(`[${l.toUpperCase()}] ${m}`, ...a));
  }

  setLevel(l: LogLevel) {
    this.level = l;
  }

  private shouldLog(l: LogLevel) {
    return this.levelOrder[l] >= this.levelOrder[this.level];
  }

  debug(msg: string, ...args: any[]) { if (this.shouldLog('debug')) this.sink('debug', msg, ...args); }
  info(msg: string, ...args: any[]) { if (this.shouldLog('info')) this.sink('info', msg, ...args); }
  warn(msg: string, ...args: any[]) { if (this.shouldLog('warn')) this.sink('warn', msg, ...args); }
  error(msg: string, ...args: any[]) { if (this.shouldLog('error')) this.sink('error', msg, ...args); }
}

// default shared logger
export const logger = new Logger('info');
