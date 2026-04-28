const {join, dirname, posix, relative, resolve} = require("path");
const {existsSync, createWriteStream} = require("fs");
const {fileURLToPath} = require("url");
const util = require("util");

/**
 * Creates an ANSI escape sequence for terminal styling.
 * @param {number|string} value - The ANSI code value
 * @returns {string} The escape sequence string
 */
const esc = (value) => `\x1b[${value}m`;

const FILL = {
    BLACK: esc(40),	            // Applies non-bold/bright black to background
    RED: esc(41),	            // Applies non-bold/bright red to background
    GREEN: esc(42),	            // Applies non-bold/bright green to background
    YELLOW: esc(43),	        // Applies non-bold/bright yellow to background
    BLUE: esc(44),	            // Applies non-bold/bright blue to background
    MAGENTA: esc(45),	        // Applies non-bold/bright magenta to background
    CYAN: esc(46),	            // Applies non-bold/bright cyan to background
    WHITE: esc(47),	            // Applies non-bold/bright white to background
    EXTENDED: esc(48),	        // Applies extended color value to the background
    DEFAULT: esc(49),	        // Applies only the background portion of the defaults
    BRIGHT_BLACK: esc(100),	    // Applies bold/bright black to background
    BRIGHT_RED: esc(101),	    // Applies bold/bright red to background
    BRIGHT_GREEN: esc(102),	    // Applies bold/bright green to background
    BRIGHT_YELLOW: esc(103),	// Applies bold/bright yellow to background
    BRIGHT_BLUE: esc(104),	    // Applies bold/bright blue to background
    BRIGHT_MAGENTA: esc(105),	// Applies bold/bright magenta to background
    BRIGHT_CYAN: esc(106),	    // Applies bold/bright cyan to background
    BRIGHT_WHITE: esc(107)	    // Applies bold/bright white to background
};

const INK = {
    BLACK: esc(30),	            // Applies non-bold/bright black to foreground
    RED: esc(31),	            // Applies non-bold/bright red to foreground
    GREEN: esc(32),	            // Applies non-bold/bright green to foreground
    YELLOW: esc(33),	        // Applies non-bold/bright yellow to foreground
    BLUE: esc(34),	            // Applies non-bold/bright blue to foreground
    MAGENTA: esc(35),	        // Applies non-bold/bright magenta to foreground
    CYAN: esc(36),	            // Applies non-bold/bright cyan to foreground
    WHITE: esc(37),	            // Applies non-bold/bright white to foreground
    EXTENDED: esc(38),	        // Applies extended color value to the foreground
    DEFAULT: esc(39),	        // Applies only the foreground portion of the defaults
    BRIGHT_BLACK: esc(90),	    // Applies bold/bright black to foreground
    BRIGHT_RED: esc(91),	    // Applies bold/bright red to foreground
    BRIGHT_GREEN: esc(92),	    // Applies bold/bright green to foreground
    BRIGHT_YELLOW: esc(93),	    // Applies bold/bright yellow to foreground
    BRIGHT_BLUE: esc(94),	    // Applies bold/bright blue to foreground
    BRIGHT_MAGENTA: esc(95),    // Applies bold/bright magenta to foreground
    BRIGHT_CYAN: esc(96),	    // Applies bold/bright cyan to foreground
    BRIGHT_WHITE: esc(97)	    // Applies bold/bright white to foreground
};

/**
 * Converts a value to a string suitable for logging output.
 * @param {*} o - The value to stringify
 * @returns {string} The stringified representation
 */
function stringify(o) {
    const type = typeof o;
    if (type === "object") {
        return util.inspect(o, {colors: true, depth: 3});
    } else if (type === "string") {
        return o.charCodeAt(0) !== 27 && o !== " " ? o : INK.DEFAULT + o;
    } else {
        return o;
    }
}

/**
 * Strips ANSI escape codes from a string by scanning for sequences.
 *
 * @param {string} line - The string to strip ANSI codes from
 * @returns {string} The string without ANSI codes
 */
function stripAnsi(line) {
    let pos = line.indexOf("\x1b[");
    if (pos === -1) {
        return line;
    } else {
        let result = line.slice(0, pos);
        while (pos !== -1) {
            const from = line.indexOf("m", pos + 2) + 1;
            if (from === 0) break;
            pos = line.indexOf("\x1b[", from);
            result += line.slice(from, pos === -1 ? undefined : pos);
        }
        return result;
    }
}

const TRACE = 4;
const DEBUG = 3;
const INFO = 2;
const WARN = 1;
const ERROR = 0;
const NOTHING = -1;

const LEVEL_TEXT = {
    [TRACE]: `${FILL.BRIGHT_BLACK} ${INK.BRIGHT_BLACK + FILL.DEFAULT}`,
    [DEBUG]: `${FILL.BLUE} ${INK.BRIGHT_BLUE + FILL.DEFAULT}`,
    [INFO]: `${FILL.BRIGHT_BLUE} ${INK.DEFAULT + FILL.DEFAULT}`,
    [WARN]: `${INK.BRIGHT_YELLOW + FILL.YELLOW}!${INK.YELLOW + FILL.DEFAULT}`,
    [ERROR]: `${INK.BRIGHT_RED + FILL.RED}X${INK.RED + FILL.DEFAULT}`,
};
const MIN_COLUMNS = 80;
const EOL = "\x1b[0m\n";

let write = process.stdout.write.bind(process.stdout);
let lastDay = -1;
let lastSuffix = null;

/**
 * Creates a suffix string for log lines.
 * If a source is provided and stdout has columns, formats it as a right-aligned suffix.
 *
 * @param {string|null|undefined} text - The source label to display
 */
function rightAlign(text) {
    return "\x1b[999G\x1b[" + (text.length + 2) + "D" + INK.BRIGHT_BLACK + text + EOL;
}

/**
 * Writes a formatted log line to stdout with timestamp, level, and optional suffix.
 *
 * @param {number} level - The log level (e.g., INFO, WARN, ERROR)
 * @param {string|null} origin - Optional right-aligned suffix (typically the module origin)
 * @param {Array} chunks - The chunks to log
 */
function writeln(level, origin, chunks) {
    const date = new Date();
    if (date.getDate() > lastDay) {
        write(INK.RED + date.toDateString() + EOL);
        lastDay = date.getDate();
        lastSuffix = null;  // Reset suffix on new day
    }
    const length = chunks.length;
    if (length > 0) {
        let line = INK.BRIGHT_BLACK + date.toISOString().slice(11, -1) + " " + LEVEL_TEXT[level] + " ";
        const head = chunks[0];
        if (Array.isArray(head) && head.raw) {
            line += head[0];
            for (let i = 1; i < length; i++) {
                line += stringify(chunks[i]);
                line += head[i];
            }
        } else {
            line += chunks[0];
            for (let i = 1; i < length; i++) {
                line += " " + stringify(chunks[i]);
            }
        }
        if (origin && process.stdout.columns >= MIN_COLUMNS) {
            line += rightAlign(origin === lastSuffix ? "-" : lastSuffix = origin);
        } else {
            line += EOL;
        }
        write(line);
    }
}

function makeAppender(target) {

    if (typeof target === "function") {
        return target;
    }

    if (target === "terminal") {
        return writeln;
    }

    const {
        threshold = "TRACE",
        file,
        flags = "a"
    } = typeof target === "string" ? {file: target} : target;

    const thresholds = {};
    switch (threshold.toUpperCase()) {
        case "TRACE":
            thresholds[TRACE] = "TRACE";
        case "DEBUG":
            thresholds[DEBUG] = "DEBUG";
        default:
        case "INFO":
            thresholds[INFO] = "INFO";
        case "WARN":
            thresholds[WARN] = "WARN";
        case "ERROR":
            thresholds[ERROR] = "ERROR";
    }

    const fileStream = createWriteStream(file, {flags});

    return (level, origin, chunks) => {
        if ((level = thresholds[level]) === undefined) {
            return;
        }
        const date = new Date();
        if (date.getDate() > lastDay) {
            write(date.toDateString() + "\n");
            lastDay = date.getDate();
            lastSuffix = null;  // Reset suffix on new day
        }
        const length = chunks.length;
        if (length > 0) {
            let line = date.toISOString().slice(11, -1)
                + "|" + level
                + "|" + origin
                + " > ";
            const head = chunks[0];
            if (Array.isArray(head) && head.raw) {
                line += stripAnsi(head[0]);
                for (let i = 1; i < length; i++) {
                    const chunk = chunks[i];
                    line += typeof chunk === "string" ? stripAnsi(chunk) : JSON.stringify(chunk);
                    line += stripAnsi(head[i]);
                }
            } else {
                line += stripAnsi(chunks[0]);
                for (let i = 1; i < length; i++) {
                    line += " " + stripAnsi(chunks[i]);
                }
            }
            fileStream.write(line + "\n");
        }
    };
}

let append = makeAppender("terminal");

let threshold;

const trace = function (...chunks) {
    if (threshold >= TRACE) append(TRACE, this.origin, chunks);
};
const debug = function (...chunks) {
    if (threshold >= DEBUG) append(DEBUG, this.origin, chunks);
};
const info = function (...chunks) {
    if (threshold >= INFO) append(INFO, this.origin, chunks);
};
const warn = function (...chunks) {
    if (threshold >= WARN) append(WARN, this.origin, chunks);
};
const error = function (...chunks) {
    if (threshold >= ERROR) append(ERROR, this.origin, chunks);
};

function setThreshold(level = INFO) {
    threshold = level;
    trace.maybe = trace.enabled = threshold >= TRACE ? trace : null;
    debug.maybe = debug.enabled = threshold >= DEBUG ? debug : null;
    info.maybe = info.enabled = threshold >= INFO ? info : null;
    warn.maybe = warn.enabled = threshold >= WARN ? warn : null;
    error.maybe = error.enabled = threshold >= ERROR ? error : null;
}

setThreshold(INFO);

/**
 * Captures the filename of the module that imported/required this logger.
 * This function walks the call stack ONCE at import time, not on every log call.
 *
 * @returns {string} The filename of the calling module
 */
function importerModule() {
    const prev = Error.prepareStackTrace;
    try {
        Error.prepareStackTrace = (_, stack) => {
            return stack[1].getFileName();
        };
        const error = new Error();
        Error.captureStackTrace(error, importerModule);
        return error.stack;
    } finally {
        Error.prepareStackTrace = prev;
    }
}

/**
 * Finds the root directory of the package containing the given file.
 *
 * @param {string} filename - The absolute path to a file
 * @returns {string|null} The package root directory, or null if not found
 */
function pkgRoot(filename) {
    let path = filename;
    let parent = dirname(path);
    while (parent !== path) {
        path = parent;
        if (existsSync(join(path, "package.json"))) {
            return path;
        }
        parent = dirname(path);
    }
    return null;
}

/**
 * Computes the source label from a filename.
 * Attempts to find the package root and create a label like "@wizkit/logging/lib/logger"
 *
 * @param {string} filename - The absolute path to the file
 * @returns {string} A human-readable source label
 */
function resolveModule(filename) {
    if (filename) {
        if (filename.startsWith("file:")) {
            filename = fileURLToPath(filename);
        }
        try {
            const basedir = pkgRoot(filename);
            if (!basedir) {
                return filename;
            }

            const {name, main} = require(`${basedir}/package.json`);
            const path = relative(basedir, filename).replace(/\\/g, "/");

            if (resolve(basedir, path) === resolve(basedir, main)) {
                return name;
            } else {
                return posix.join(name, path.slice(0, path.lastIndexOf(".")));
            }
        } catch (ignored) {
            return filename;
        }
    }
}

const api = {

    __proto__: Function.prototype,

    colors: {
        INK,
        FILL,
        CLEAR: esc(0)
    },
    esc,
    stripAnsi,

    trace,
    debug,
    info,
    warn,
    error,

    levels: {
        TRACE,
        DEBUG,
        INFO,
        WARN,
        ERROR,
        NOTHING,
    },

    get level() {
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
                return "silent";
        }
    },

    set level(level) {
        if (typeof level === "number" && level >= -1 && level <= 4) {
            return setThreshold(level);
        }
        if (typeof level === "string") switch (level.toLowerCase()) {
            case "trace":
                return setThreshold(4);
            case "debug":
                return setThreshold(3);
            case "info":
                return setThreshold(2);
            case "warn":
                return setThreshold(1);
            case "error":
                return setThreshold(0);
            case "silent":
                return setThreshold(-1);
        }
        throw new Error(`cannot set level: ${level}`);
    },

    get appender() {
        return append;
    },

    set appender(fns) {
        if (Array.isArray(fns)) {
            const appenders = fns.map(fn => makeAppender(fn));
            append = (level, origin, chunks) => {
                for (const fn of appenders) {
                    fn(level, origin, chunks);
                }
            };
        } else if (fns) {
            append = makeAppender(fns);
        }
    },

    get writer() {
        return write;
    },

    set writer(fn) {
        write = fn;
    },

    stringify
};

/**
 * Creates a logger instance with configurable log levels.
 *
 * @typedef {Object} LoggerMethods
 * @property {Function} trace - Log at trace level
 * @property {Function} debug - Log at debug level
 * @property {Function} info - Log at info level
 * @property {Function} warn - Log at warn level
 * @property {Function} error - Log at error level
 * @property {string} level - Current log level
 * @property {Object} can - Flags indicating which levels are enabled
 * @property {Object} maybe - Conditional log functions (null if level disabled)
 *
 * @param {string} [origin] - The origin label displayed as a suffix in log lines
 * @returns {Function & LoggerMethods} A logger function with level methods
 */
function logger(origin) {
    const log = (...chunks) => {
        if (threshold >= 0) append(INFO, origin, chunks);
    };
    Object.setPrototypeOf(log, api);
    log.origin = origin;
    log.trace = trace;
    log.debug = debug;
    log.info = info;
    log.warn = warn;
    log.error = error;
    return log;
}

module.exports = Object.create(api, {
    log: {
        get() {
            const filename = importerModule();
            const origin = resolveModule(filename);
            return logger(origin);
        }
    },
    logger: {
        value: logger
    }
});
