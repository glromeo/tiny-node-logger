const log = require("../index.js");

log.level = log.TRACE;

log.details = true;

log.trace("Hello world!");
log.debug("Hello world!");
log.info("Hello world!");
log.warn("Hello world!");
log.error("Hello world!");
