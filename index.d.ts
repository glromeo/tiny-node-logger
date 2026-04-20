export type Log = {
    (strings: string[] | string | unknown, ...keys: any[]): void;
    enabled: Log | null;
    maybe: Log | null;
}

export type Level =
    "trace" | "debug" | "info" | "warn" | "error" | "silent" |
    "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "SILENT";

export type AppenderFunction = (level: string, origin: string | null, chunks: any[]) => void;

export type FileAppender = {
    file: string;
    threshold?: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "trace" | "debug" | "info" | "warn" | "error";
    flags?: string;
};

export type Logger = Log & {
    trace: Log;
    debug: Log;
    info: Log;
    warn: Log;
    error: Log;
}

export interface Colors {
    INK: {
        BLACK: string;
        RED: string;
        GREEN: string;
        YELLOW: string;
        BLUE: string;
        MAGENTA: string;
        CYAN: string;
        WHITE: string;
        EXTENDED: string;
        DEFAULT: string;
        BRIGHT_BLACK: string;
        BRIGHT_RED: string;
        BRIGHT_GREEN: string;
        BRIGHT_YELLOW: string;
        BRIGHT_BLUE: string;
        BRIGHT_MAGENTA: string;
        BRIGHT_CYAN: string;
        BRIGHT_WHITE: string;
    };
    FILL: {
        BLACK: string;
        RED: string;
        GREEN: string;
        YELLOW: string;
        BLUE: string;
        MAGENTA: string;
        CYAN: string;
        WHITE: string;
        EXTENDED: string;
        DEFAULT: string;
        BRIGHT_BLACK: string;
        BRIGHT_RED: string;
        BRIGHT_GREEN: string;
        BRIGHT_YELLOW: string;
        BRIGHT_BLUE: string;
        BRIGHT_MAGENTA: string;
        BRIGHT_CYAN: string;
        BRIGHT_WHITE: string;
    };
    CLEAR: string;
}

export type Appender = AppenderFunction | string | FileAppender | Array<Appender>;

export interface Logging {

    levels: {
        TRACE: 4;
        DEBUG: 3;
        INFO: 2;
        WARN: 1;
        ERROR: 0;
        NOTHING: -1;
    };

    colors: Colors;

    trace: Log;
    debug: Log;
    info: Log;
    warn: Log;
    error: Log;

    log: Logger;
    logger: (origin?: string) => Logger;

    esc(value: number | string): string;

    stripAnsi(str: string): string;

    get appender(): AppenderFunction;

    set appender(fns: Appender);

    get writer(): (chunk: string) => void;

    set writer(fn: (chunk: string) => void);

    get level(): "trace" | "debug" | "info" | "warn" | "error" | "silent";

    set level(value: Level | 4 | 3 | 2 | 1 | 0 | -1)

    stringify(object: any): string;
}

declare const logging: Logging;
export default logging;
