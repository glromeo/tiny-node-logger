const log = require("./lib");

setTimeout(function () {

    log.level = log.TRACE; // ...or just "trace"

    log.trace("Hello world!");
    log.debug("Hello world!");
    log.info("Hello world!");
    log.warn("Hello world!");
    log.error("Hello world!");

    const {trace, debug, info, warn, error} = log;

    trace`Hello world!`;
    debug`Hello world!`;
    info`Hello world!`;
    warn`Hello world!`;
    error`Hello world!`;

}, 250);