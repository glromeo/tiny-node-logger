const {log, levels: {TRACE}} = require("tiny-node-logger");

const PREFER_CONSTANTS = false;
const PREFER_FUNCTIONS = true;
const PREFER_OPTIONALS = false;

if (PREFER_CONSTANTS) {
    log.level = TRACE;
} else {
    log.level = "trace";
}

if (PREFER_FUNCTIONS) {
    if (PREFER_OPTIONALS) {
        log.trace.maybe?.("Hello world!");
        log.debug.maybe?.("Hello world!");
        log.info.maybe?.("Hello world!");
        log.warn.maybe?.("Hello world!");
        log.error.maybe?.("Hello world!");
    } else {
        log.trace("Hello world!");
        log.debug("Hello world!");
        log.info("Hello world!");
        log.warn("Hello world!");
        log.error("Hello world!");
    }
} else {
    const {trace, debug, info, warn, error} = log;
    trace`Hello world!`;
    debug`Hello world!`;
    info`Hello world!`;
    warn`Hello world!`;
    error`Hello world!`;
}
