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
    default: 'black',
    trace: 'gray',
    debug: 'green',
    info: 'black',
    warn: 'yellow',
    error: 'red',
    timestamp: 'blue'
}

function timestamp(color) {
    const date = new Date().toISOString();
    return '[' + chalk[color](date.substring(0, 10) + ' ' + date.substring(11, 23)) + '] ';
}

function stringify(o, color = 'black') {
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

function writeln(color, timestamp, head, tail) {

    process.stdout.write(timestamp);

    const count = tail.length;

    if (Array.isArray(head) && count === (head.length - 1)) {
        for (let i = 0; i < count; i++) {
            if (head[i].length) {
                process.stdout.write(stringify(head[i], color));
            }
            process.stdout.write(stringify(tail[i], color));
        }
        if (head[count].length) {
            process.stdout.write(stringify(head[count], color));
        }
    } else {
        process.stdout.write(stringify(head, color));
        for (const item of tail) {
            process.stdout.write(' ');
            process.stdout.write(stringify(item, color));
        }
    }

    process.stdout.write('\n');
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
            writeln(colors.trace, timestamp(colors.timestamp), strings, keys);
        }
    },

    debug(strings, ...keys) {
        if (levels.has(DEBUG)) {
            writeln(colors.debug, timestamp(colors.timestamp), strings, keys);
        }
    },

    info(strings, ...keys) {
        if (levels.has(INFO)) {
            writeln(colors.info, timestamp(colors.timestamp), strings, keys);
        }
    },

    warn(strings, ...keys) {
        if (levels.has(WARN)) {
            writeln(colors.warn, timestamp(colors.timestamp), strings, keys);
        }
    },

    error(strings, ...keys) {
        if (levels.has(ERROR)) {
            writeln(colors.error, timestamp(colors.timestamp), strings, keys);
        }
    },

    stringify
}

Object.defineProperty(module.exports, "level", {
    enumerable: true,
    set(level) {
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
    get() {
        return levels.values().next().value || NOTHING;
    }
})

module.exports.level = "info";
