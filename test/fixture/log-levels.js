const log = require("tiny-node-logger");
const {
    trace, debug, info, warn, error
} = log;

expect(log.level).to.eq("info");

// this means

expect(log.includes("trace")).to.be.false;
expect(log.includes("debug")).to.be.false;
expect(log.includes("info")).to.be.true;
expect(log.includes("warn")).to.be.true;
expect(log.includes("error")).to.be.true;

// the level can be changed using the setter

log.setLevel("debug");

expect(log.level).to.eq("debug");

expect(log.includes("debug")).to.be.true;

// or with the level property

log.level = "trace";

expect(log.level).to.eq("trace");

expect(log.includes("trace")).to.be.true;

// given trace level all these statements are written to the writer (stdout)

trace`this is a trace message`;
debug`this is a debug message`;
info`this is an info message`;
warn`this is a warn message`;
error`this is an error message`;

// each level acts as a threshold

log.level = "debug";

expect(log.level).to.eq("debug");

trace`this shall not pass`;
debug`this shall pass`;

log.level = "info";

expect(log.level).to.eq("info");

debug`this shall not pass`;
info`this shall pass`;

log.level = "warn";

expect(log.level).to.eq("warn");

info`this shall not pass`;
warn`this shall pass`;

expect(log.includes("info")).to.be.false;

log.level = "error";

expect(log.level).to.eq("error");

warn`this shall not pass`;
error`this shall pass`;

expect(log.includes("warn")).to.be.false;

// there are constants are constants for all the levels

expect(log.TRACE).to.eq("trace");
expect(log.DEBUG).to.eq("debug");
expect(log.INFO).to.eq("info");
expect(log.WARN).to.eq("warn");
expect(log.ERROR).to.eq("error");

// to completely mute the logger there's the "nothing" level

expect(log.NOTHING).to.eq("nothing");

// when applied...

log.level = log.NOTHING;

expect(log.level).to.eq("nothing");

// then none of these log statements will write anything

trace`this shall not pass`;
debug`this shall not pass`;
info`this shall not pass`;
warn`this shall not pass`;
error`this shall not pass`;

// log level "nothing" prevents even the errors from being logged

expect(log.includes("error")).to.be.false;

// note that the simple log function ignores the levels altogether hence...

log`this is written because it's not affected by the "nothing" level`;

// only these 5+1 log levels are meaningful

expect(log.includes("whatever")).to.be.false;

expect(() => {
    log.level = "whatever";
}).to.throw("cannot set level: whatever");
