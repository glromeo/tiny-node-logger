const chalk = require("chalk");
const util = require("util");
const {basename} = require("path");

const colors = {
    default: "black",
    trace: "gray",
    debug: "green",
    info: "black",
    warn: "yellow",
    error: "red",
    timestamp: "blue"
};

function stringify(o, color) {
    const type = typeof o;
    if (type === "string" && color) {
        const hasEscape = o.charCodeAt(0) === 27;
        const isBlank = o.charCodeAt(0) === 32 && o.length === 1 || !o.trim();
        return hasEscape || isBlank ? o : chalk[color](o);
    } else if (type === "object") {
        return util.inspect(o, {colors: true, depth: 3});
    } else {
        return String(o);
    }
}

let write = process.stdout.write.bind(process.stdout);

let details = false;

function getStackTrace(error, stack) {
    return stack;
}

function callSite(error, depth) {
    const prepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = getStackTrace;
    const stack = error.stack;
    Error.prepareStackTrace = prepareStackTrace;
    return stack[depth];
}

function writeln(color, head, tail) {

    const count = tail.length;

    const date = new Date().toISOString();
    let line = "[" + chalk[colors.timestamp](date.substring(0, 10) + " " + date.substring(11, 23)) + "] ";

    if (details) {
        const cs = callSite(new Error(), 2);
        line += `${(basename(cs.getFileName()))} (${(cs.getLineNumber())}:${(cs.getColumnNumber())}) `;
    }

    if (Array.isArray(head) && count === (head.length - 1)) {
        for (let i = 0; i < count; i++) {
            if (head[i].length) {
                line += stringify(head[i], color);
            }
            line += stringify(tail[i], color);
        }
        if (head[count].length) {
            line += stringify(head[count], color);
        }
    } else {
        line += stringify(head, color);
        for (const item of tail) {
            line += " " + stringify(item, color);
        }
    }

    write(line + "\n");
}

function log(strings, ...keys) {
    writeln(null, strings, keys);
}

module.exports = log;

let threshold = 2;

Object.assign(module.exports, {

    colors,

    TRACE: 4,
    DEBUG: 3,
    INFO: 2,
    WARN: 1,
    ERROR: 0,
    NOTHING: -1,

    trace(strings, ...keys) {
        if (threshold >= 4) {
            writeln(colors.trace, strings, keys);
        }
    },

    debug(strings, ...keys) {
        if (threshold >= 3) {
            writeln(colors.debug, strings, keys);
        }
    },

    info(strings, ...keys) {
        if (threshold >= 2) {
            writeln(colors.info, strings, keys);
        }
    },

    warn(strings, ...keys) {
        if (threshold >= 1) {
            writeln(colors.warn, strings, keys);
        }
    },

    error(strings, ...keys) {
        if (threshold >= 0) {
            writeln(colors.error, strings, keys);
        }
    },

    setLevel(value) {
        this.level = value;
    },

    stringify
});

Object.defineProperty(module.exports, "write", {
    enumerable: false,
    get() {
        return write;
    },
    set(replacement) {
        write = replacement;
    }
});

Object.defineProperty(module.exports, "details", {
    enumerable: false,
    get() {
        return details;
    },
    set(enable) {
        details = enable;
    }
});

Object.defineProperty(module.exports, "level", {
    enumerable: false,
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
        if (typeof level === "number") {
            if (isNaN(level)) {
                throw new Error("cannot set level: " + level);
            }
            threshold = level;
            return;
        } else {
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
        }
        throw new Error("cannot set level: " + level);
    }
});

module.exports.level = "info";
