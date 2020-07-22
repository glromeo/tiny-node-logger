const chalk = require("chalk");
const util = require("util");

const levels = new Set();

const TRACE = Symbol.for("trace");
const DEBUG = Symbol.for("debug");
const INFO = Symbol.for("info");
const WARN = Symbol.for("warn");
const ERROR = Symbol.for("error");
const NOTHING = Symbol.for("nothing");

const colors = {
    default: "black",
    trace: "gray",
    debug: "green",
    info: "black",
    warn: "yellow",
    error: "red",
    timestamp: "blue"
};

function timestamp(color) {
    const date = new Date().toISOString();
    return "[" + chalk[color](date.substring(0, 10) + " " + date.substring(11, 23)) + "] ";
}

function stringify(o, color = "black") {
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

function writeln(color, head, tail) {

    const count = tail.length;

    if (Array.isArray(head) && count === (head.length - 1)) {
        for (let i = 0; i < count; i++) {
            if (head[i].length) {
                write(stringify(head[i], color));
            }
            write(stringify(tail[i], color));
        }
        if (head[count].length) {
            write(stringify(head[count], color));
        }
    } else {
        write(stringify(head, color));
        for (const item of tail) {
            write(" ");
            write(stringify(item, color));
        }
    }

    write("\n");
}

module.exports = {

    colors,

    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    NOTHING,

    trace(strings, ...keys) {
        if (levels.has(TRACE)) {
            write(timestamp(colors.timestamp));
            write(this.details);
            writeln(colors.trace, strings, keys);
        }
    },

    debug(strings, ...keys) {
        if (levels.has(DEBUG)) {
            write(timestamp(colors.timestamp));
            write(this.details);
            writeln(colors.debug, strings, keys);
        }
    },

    info(strings, ...keys) {
        if (levels.has(INFO)) {
            write(timestamp(colors.timestamp));
            write(this.details);
            writeln(colors.info, strings, keys);
        }
    },

    warn(strings, ...keys) {
        if (levels.has(WARN)) {
            write(timestamp(colors.timestamp));
            write(this.details);
            writeln(colors.warn, strings, keys);
        }
    },

    error(strings, ...keys) {
        if (levels.has(ERROR)) {
            write(timestamp(colors.timestamp));
            write(this.details);
            writeln(colors.error, strings, keys);
        }
    },

    get details() {
        return "";
    },

    set details(show) {

        const details = require("./details.js");
        const nothing = () => "";

        const set = (show) => Object.defineProperty(this, "details", {
            enumerable: true,
            get: show ? details : nothing,
            set
        });

        set(show);
    },

    set level(level) {
        // noinspection FallThroughInSwitchStatementJS
        const sym = typeof level === "string" ? Symbol.for(level.toLowerCase()) : level;
        levels.clear();
        switch (sym) {
            case TRACE:
                levels.add(TRACE);
            case DEBUG:
                levels.add(DEBUG);
            case INFO:
                levels.add(INFO);
            case WARN:
                levels.add(WARN);
            case ERROR:
                levels.add(ERROR);
            case NOTHING:
                return;
            default:
                throw new Error("cannot set level: " + level);
        }
    },

    get level() {
        return levels.values().next().value || NOTHING;
    },

    setLevel(value) {
        this.level = value;
    },

    stringify
};

Object.defineProperty(module.exports, "write", {
    enumerable: false,
    get() {
        return write;
    },
    set(replacement) {
        write = replacement;
    }
});

module.exports.level = "info";
