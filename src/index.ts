import {inspect} from "util";
import {sep} from "path";
import quotes from "./quotes";
import CallSite = NodeJS.CallSite;

export type LogWriter = (text: string) => boolean;
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "nothing";

export const BACKGROUND = {
    BLACK: "\x1B[40m",	            // Applies non-bold/bright black to background
    RED: "\x1B[41m",	            // Applies non-bold/bright red to background
    GREEN: "\x1B[42m",	            // Applies non-bold/bright green to background
    YELLOW: "\x1B[43m",	            // Applies non-bold/bright yellow to background
    BLUE: "\x1B[44m",	            // Applies non-bold/bright blue to background
    MAGENTA: "\x1B[45m",	        // Applies non-bold/bright magenta to background
    CYAN: "\x1B[46m",	            // Applies non-bold/bright cyan to background
    WHITE: "\x1B[47m",	            // Applies non-bold/bright white to background
    EXTENDED: "\x1B[48m",	        // Applies extended color value to the background
    DEFAULT: "\x1B[49m",	        // Applies only the background portion of the defaults
    BRIGHT_BLACK: "\x1B[100m",	    // Applies bold/bright black to background
    BRIGHT_RED: "\x1B[101m",	    // Applies bold/bright red to background
    BRIGHT_GREEN: "\x1B[102m",	    // Applies bold/bright green to background
    BRIGHT_YELLOW: "\x1B[103m",	    // Applies bold/bright yellow to background
    BRIGHT_BLUE: "\x1B[104m",	    // Applies bold/bright blue to background
    BRIGHT_MAGENTA: "\x1B[105m",	// Applies bold/bright magenta to background
    BRIGHT_CYAN: "\x1B[106m",	    // Applies bold/bright cyan to background
    BRIGHT_WHITE: "\x1B[107m",	    // Applies bold/bright white to background
};

export const COLOR = {
    BLACK: "\x1B[30m",	            // Applies non-bold/bright black to foreground
    RED: "\x1B[31m",	            // Applies non-bold/bright red to foreground
    GREEN: "\x1B[32m",	            // Applies non-bold/bright green to foreground
    YELLOW: "\x1B[33m",	            // Applies non-bold/bright yellow to foreground
    BLUE: "\x1B[34m",	            // Applies non-bold/bright blue to foreground
    MAGENTA: "\x1B[35m",	        // Applies non-bold/bright magenta to foreground
    CYAN: "\x1B[36m",	            // Applies non-bold/bright cyan to foreground
    WHITE: "\x1B[37m",	            // Applies non-bold/bright white to foreground
    EXTENDED: "\x1B[38m",	        // Applies extended color value to the foreground
    DEFAULT: "\x1B[39m",	        // Applies only the foreground portion of the defaults
    BRIGHT_BLACK: "\x1B[90m",	    // Applies bold/bright black to foreground
    BRIGHT_RED: "\x1B[91m",	        // Applies bold/bright red to foreground
    BRIGHT_GREEN: "\x1B[92m",	    // Applies bold/bright green to foreground
    BRIGHT_YELLOW: "\x1B[93m",	    // Applies bold/bright yellow to foreground
    BRIGHT_BLUE: "\x1B[94m",	    // Applies bold/bright blue to foreground
    BRIGHT_MAGENTA: "\x1B[95m",     // Applies bold/bright magenta to foreground
    BRIGHT_CYAN: "\x1B[96m",	    // Applies bold/bright cyan to foreground
    BRIGHT_WHITE: "\x1B[97m",	    // Applies bold/bright white to foreground
};

const LEVELS = {
    trace: ` ${BACKGROUND.BRIGHT_BLACK} ${COLOR.BRIGHT_BLACK + BACKGROUND.DEFAULT} `,
    debug: ` ${BACKGROUND.BLUE} ${COLOR.BRIGHT_BLUE + BACKGROUND.DEFAULT} `,
    info: ` ${BACKGROUND.BRIGHT_BLUE} ${COLOR.DEFAULT + BACKGROUND.DEFAULT} `,
    warn: ` ${COLOR.BRIGHT_YELLOW + BACKGROUND.YELLOW}!${COLOR.YELLOW + BACKGROUND.DEFAULT} `,
    error: ` ${COLOR.BRIGHT_RED + BACKGROUND.RED}X${COLOR.RED + BACKGROUND.DEFAULT} `,
};

export function colorify(o: any): string {
    const type = typeof o;
    if (type === "object") {
        return inspect(o, {colors: true, depth: 3});
    } else if (type === "string") {
        return o.charCodeAt(0) !== 27 && o !== " " ? o : COLOR.DEFAULT + o;
    } else {
        return o;
    }
}

function callSite(error: Error, depth: number): CallSite {
    const prepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (error, stack) => stack[depth];
    const site: CallSite = error.stack as any;
    Error.prepareStackTrace = prepareStackTrace;
    return site as CallSite;
}

let write: LogWriter = process.stdout.write.bind(process.stdout);
let lastDay = -1;

function writeln(level: string, head: TemplateStringsArray | any, tail: any[]): void {

    const count = tail.length;

    const date = new Date();
    if (date.getDay() > lastDay) {
        write(COLOR.RED + date.toDateString() + COLOR.DEFAULT + " – " + quotes[Math.floor(Math.random() * quotes.length)] + "\n");
        lastDay = date.getDay();
    }

    const timestamp = date.toISOString();

    let line = COLOR.BRIGHT_BLACK + timestamp.substring(11, 23) + level;

    if (Array.isArray(head) && count === (head.length - 1)) {
        for (let i = 0; i < count; i++) {
            if (head[i].length) {
                line += colorify(head[i]);
            }
            line += colorify(tail[i]);
        }
        if (head[count].length) {
            line += colorify(head[count]);
        }
    } else {
        line += colorify(head);
        for (const item of tail) {
            line += " " + colorify(item);
        }
    }

    const columns = process.stdout.columns;
    if (columns > 80) {
        const cs = callSite(new Error(), 2);
        const fileName = cs.getFileName() ?? "unknown";
        const shortFilename = fileName.substring(fileName.lastIndexOf(sep) + 1);
        const lineNumber = cs.getLineNumber();
        const suffix = COLOR.BRIGHT_BLACK + shortFilename + COLOR.BLACK + ":" + COLOR.BRIGHT_BLUE + lineNumber + COLOR.DEFAULT;

        write(`${line} \x1B[${columns - suffix.length + 21}G${suffix}\n`);
    } else {
        write(line + "\n");
    }
}

let threshold = 2;

export const TRACE = "trace";
export const DEBUG = "debug";
export const INFO = "info";
export const WARN = "warn";
export const ERROR = "error";
export const NOTHING = "nothing";

export function log(strings: TemplateStringsArray | any, ...keys: any[]) {
    return writeln(LEVELS.info, strings, keys);
}

export function trace(strings: TemplateStringsArray | any, ...keys: any[]) {
    if (threshold >= 4) {
        writeln(LEVELS.trace, strings, keys);
    }
}

export function debug(strings: TemplateStringsArray | any, ...keys: any[]) {
    if (threshold >= 3) {
        writeln(LEVELS.debug, strings, keys);
    }
}

export function info(strings: TemplateStringsArray | any, ...keys: any[]) {
    if (threshold >= 2) {
        writeln(LEVELS.info, strings, keys);
    }
}

export function warn(strings: TemplateStringsArray | any, ...keys: any[]) {
    if (threshold >= 1) {
        writeln(LEVELS.warn, strings, keys);
    }
}

export function error(strings: TemplateStringsArray | any, ...keys: any[]) {
    if (threshold >= 0) {
        writeln(LEVELS.error, strings, keys);
    }
}

export function includes(level: string): boolean {
    switch (level.toLowerCase()) {
        case "trace":
            return threshold >= 4;
        case "debug":
            return threshold >= 3;
        case "info":
            return threshold >= 2;
        case "warn":
            return threshold >= 1;
        case "error":
            return threshold >= 0;
        default:
            return false;
    }
}

const logger = {

    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    NOTHING,

    log,

    trace,
    debug,
    info,
    warn,
    error,

    includes,

    get writer(): LogWriter {
        return write;
    },

    set writer(writer: LogWriter) {
        write = writer;
    },

    get level(): LogLevel {
        switch (threshold) {
            case 4:
                return "trace";
            case 3:
                return "debug";
            case 2:
                return "info";
            case 1:
                return "warn";
            case 0:
                return "error";
            default:
                return "nothing";
        }
    },

    set level(level: LogLevel | string) {
        switch (level.toLowerCase()) {
            case "trace":
                threshold = 4;
                return;
            case "debug":
                threshold = 3;
                return;
            case "info":
                threshold = 2;
                return;
            case "warn":
                threshold = 1;
                return;
            case "error":
                threshold = 0;
                return;
            case "nothing":
                threshold = -1;
                return;
        }
        throw new Error("cannot set level: " + level);
    }
};

logger.level = "info";

Object.defineProperty(exports, "writer", Object.getOwnPropertyDescriptor(logger, "writer")!);
Object.defineProperty(exports, "level", Object.getOwnPropertyDescriptor(logger, "level")!);

export default Object.defineProperties(log, Object.getOwnPropertyDescriptors(logger)) as typeof log & typeof logger;
