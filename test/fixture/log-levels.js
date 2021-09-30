const logger = require("tiny-node-logger");
const {
    trace, debug, info, warn, error, log
} = logger;

expect(logger.level).to.eq("info");

// this means

expect(logger.includes("trace")).to.be.false;
expect(logger.includes("debug")).to.be.false;
expect(logger.includes("info")).to.be.true;
expect(logger.includes("warn")).to.be.true;
expect(logger.includes("error")).to.be.true;

// the level can be changed using the level property an a string value

logger.level = "debug";

expect(logger.level).to.eq("debug");

expect(logger.includes("debug")).to.be.true;

// or with the level property and a constant

logger.level = logger.TRACE;

expect(logger.level).to.eq("trace");

expect(logger.includes("trace")).to.be.true;

// given trace level all these statements are written to the writer (stdout)

trace`this is a trace message`;
debug`this is a debug message`;
info`this is an info message`;
warn`this is a warn message`;
error`this is an error message`;

// each level acts as a threshold

logger.level = "debug";

expect(logger.level).to.eq("debug");

trace`this shall not pass`;
debug`this shall pass`;

logger.level = "info";

expect(logger.level).to.eq("info");

debug`this shall not pass`;
info`this shall pass`;

logger.level = "warn";

expect(logger.level).to.eq("warn");

info`this shall not pass`;
warn`this shall pass`;

expect(logger.includes("info")).to.be.false;

logger.level = "error";

expect(logger.level).to.eq("error");

warn`this shall not pass`;
error`this shall pass`;

expect(logger.includes("warn")).to.be.false;

// there are constants are constants for all the levels

expect(logger.TRACE).to.eq("trace");
expect(logger.DEBUG).to.eq("debug");
expect(logger.INFO).to.eq("info");
expect(logger.WARN).to.eq("warn");
expect(logger.ERROR).to.eq("error");

// to completely mute the logger there's the "nothing" level

expect(logger.NOTHING).to.eq("nothing");

// when applied...

logger.level = logger.NOTHING;

expect(logger.level).to.eq("nothing");

// then none of these log statements will write anything

trace`this shall not pass`;
debug`this shall not pass`;
info`this shall not pass`;
warn`this shall not pass`;
error`this shall not pass`;

// log level "nothing" prevents even the errors from being logged

expect(logger.includes("error")).to.be.false;

// note that the simple log function ignores the levels altogether hence...

log`this is written because it's not affected by the "nothing" level`;

// only these 5+1 log levels are meaningful

expect(logger.includes("whatever")).to.be.false;

expect(() => {
    logger.level = "whatever";
}).to.throw("cannot set level: whatever");
