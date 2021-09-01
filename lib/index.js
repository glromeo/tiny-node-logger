"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR = exports.BACKGROUND = void 0;
const util_1 = require("util");
const path_1 = require("path");
const quotes_1 = __importDefault(require("./quotes"));
exports.BACKGROUND = {
    BLACK: "\x1B[40m",
    RED: "\x1B[41m",
    GREEN: "\x1B[42m",
    YELLOW: "\x1B[43m",
    BLUE: "\x1B[44m",
    MAGENTA: "\x1B[45m",
    CYAN: "\x1B[46m",
    WHITE: "\x1B[47m",
    EXTENDED: "\x1B[48m",
    DEFAULT: "\x1B[49m",
    BRIGHT_BLACK: "\x1B[100m",
    BRIGHT_RED: "\x1B[101m",
    BRIGHT_GREEN: "\x1B[102m",
    BRIGHT_YELLOW: "\x1B[103m",
    BRIGHT_BLUE: "\x1B[104m",
    BRIGHT_MAGENTA: "\x1B[105m",
    BRIGHT_CYAN: "\x1B[106m",
    BRIGHT_WHITE: "\x1B[107m",
};
exports.COLOR = {
    BLACK: "\x1B[30m",
    RED: "\x1B[31m",
    GREEN: "\x1B[32m",
    YELLOW: "\x1B[33m",
    BLUE: "\x1B[34m",
    MAGENTA: "\x1B[35m",
    CYAN: "\x1B[36m",
    WHITE: "\x1B[37m",
    EXTENDED: "\x1B[38m",
    DEFAULT: "\x1B[39m",
    BRIGHT_BLACK: "\x1B[90m",
    BRIGHT_RED: "\x1B[91m",
    BRIGHT_GREEN: "\x1B[92m",
    BRIGHT_YELLOW: "\x1B[93m",
    BRIGHT_BLUE: "\x1B[94m",
    BRIGHT_MAGENTA: "\x1B[95m",
    BRIGHT_CYAN: "\x1B[96m",
    BRIGHT_WHITE: "\x1B[97m",
};
const LEVELS = {
    trace: ` ${exports.BACKGROUND.BRIGHT_BLACK} ${exports.COLOR.BRIGHT_BLACK + exports.BACKGROUND.DEFAULT} `,
    debug: ` ${exports.BACKGROUND.BLUE} ${exports.COLOR.BRIGHT_BLUE + exports.BACKGROUND.DEFAULT} `,
    info: ` ${exports.BACKGROUND.BRIGHT_BLUE} ${exports.COLOR.DEFAULT + exports.BACKGROUND.DEFAULT} `,
    warn: ` ${exports.COLOR.BRIGHT_YELLOW + exports.BACKGROUND.YELLOW}!${exports.COLOR.YELLOW + exports.BACKGROUND.DEFAULT} `,
    error: ` ${exports.COLOR.BRIGHT_RED + exports.BACKGROUND.RED}X${exports.COLOR.RED + exports.BACKGROUND.DEFAULT} `,
};
function stringify(o) {
    const type = typeof o;
    if (type === "object") {
        return (0, util_1.inspect)(o, { colors: true, depth: 3 });
    }
    else if (type === "string") {
        return o.charCodeAt(0) !== 27 && o !== " " ? o : exports.COLOR.DEFAULT + o;
    }
    else {
        return o;
    }
}
function callSite(error, depth) {
    const prepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (error, stack) => stack[depth];
    const site = error.stack;
    Error.prepareStackTrace = prepareStackTrace;
    return site;
}
let write = process.stdout.write.bind(process.stdout);
let lastDay = -1;
function writeln(level, head, tail) {
    var _a;
    const count = tail.length;
    const date = new Date();
    if (date.getDay() > lastDay) {
        write(exports.COLOR.RED + date.toDateString() + exports.COLOR.DEFAULT + " – " + quotes_1.default[Math.floor(Math.random() * quotes_1.default.length)] + "\n");
        lastDay = date.getDay();
    }
    const timestamp = date.toISOString();
    let line = exports.COLOR.BRIGHT_BLACK + timestamp.substring(11, 23) + level;
    if (Array.isArray(head) && count === (head.length - 1)) {
        for (let i = 0; i < count; i++) {
            if (head[i].length) {
                line += stringify(head[i]);
            }
            line += stringify(tail[i]);
        }
        if (head[count].length) {
            line += stringify(head[count]);
        }
    }
    else {
        line += stringify(head);
        for (const item of tail) {
            line += " " + stringify(item);
        }
    }
    const columns = process.stdout.columns;
    if (columns > 80) {
        const cs = callSite(new Error(), 2);
        const fileName = (_a = cs.getFileName()) !== null && _a !== void 0 ? _a : "unknown";
        const shortFilename = fileName.substring(fileName.lastIndexOf(path_1.sep) + 1);
        const lineNumber = cs.getLineNumber();
        const suffix = exports.COLOR.BRIGHT_BLACK + shortFilename + exports.COLOR.BLACK + ":" + exports.COLOR.BRIGHT_BLUE + lineNumber + exports.COLOR.DEFAULT;
        write(`${line} \x1B[${columns - suffix.length + 21}G${suffix}\n`);
    }
    else {
        write(line + "\n");
    }
}
function log(strings, ...keys) {
    return writeln(LEVELS.info, strings, keys);
}
let threshold = 2;
Object.assign(log, {
    TRACE: "trace",
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    NOTHING: "nothing",
    trace(strings, ...keys) {
        if (threshold >= 4) {
            writeln(LEVELS.trace, strings, keys);
        }
    },
    debug(strings, ...keys) {
        if (threshold >= 3) {
            writeln(LEVELS.debug, strings, keys);
        }
    },
    info(strings, ...keys) {
        if (threshold >= 2) {
            writeln(LEVELS.info, strings, keys);
        }
    },
    warn(strings, ...keys) {
        if (threshold >= 1) {
            writeln(LEVELS.warn, strings, keys);
        }
    },
    error(strings, ...keys) {
        if (threshold >= 0) {
            writeln(LEVELS.error, strings, keys);
        }
    },
    setLevel(value) {
        log.level = value;
    },
    includes(level) {
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
    },
    stringify
});
Object.defineProperty(log, "writer", {
    enumerable: true,
    get() {
        return write;
    },
    set(writer) {
        return write = writer;
    }
});
Object.defineProperty(log, "level", {
    enumerable: true,
    get() {
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
    set(level) {
        switch (level.toLowerCase()) {
            case "trace":
                threshold = 4;
                return log;
            case "debug":
                threshold = 3;
                return log;
            case "info":
                threshold = 2;
                return log;
            case "warn":
                threshold = 1;
                return log;
            case "error":
                threshold = 0;
                return log;
            case "nothing":
                threshold = -1;
                return log;
        }
        throw new Error("cannot set level: " + level);
    }
});
log.level = "info";
module.exports = log;
exports.default = log;
//# sourceMappingURL=index.js.map