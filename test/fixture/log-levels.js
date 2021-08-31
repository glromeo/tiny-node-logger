const log = require("tiny-node-logger");
const {trace, debug, info, warn, error} = log;

expect(log.level).to.eq("info");                // default log level is info

expect(log.includes("trace")).to.be.false;
expect(log.includes("debug")).to.be.false;
expect(log.includes("info")).to.be.true;
expect(log.includes("warn")).to.be.true;
expect(log.includes("error")).to.be.true;

log.setLevel("trace");                          // this lower the level to trace

expect(log.level).to.eq("trace");

trace`this is a trace message`;
debug`this is a debug message`;
info`this is an info message`;
warn`this is a warn message`;
error`this is an error message`;

expect(log.includes("trace")).to.be.true;
expect(log.includes("debug")).to.be.true;

log.level = "debug";
expect(log.level).to.eq("debug");
log.level = "info";
expect(log.level).to.eq("info");
log.level = "warn";
expect(log.level).to.eq("warn");
log.level = "error";
expect(log.level).to.eq("error");

expect(log.includes("info")).to.be.false;
expect(log.includes("warn")).to.be.false;

log.level = log.NOTHING;                        // this alternate syntax raises the level to "nothing"

trace`this is a trace message`;
debug`this is a debug message`;
info`this is an info message`;
warn`this is a warn message`;
error`this is an error message`;

expect(log.level).to.eq("nothing");

log`log is never ignored`;

expect(log.includes("debug")).to.be.false;
expect(log.includes("info")).to.be.false;
expect(log.includes("warn")).to.be.false;
expect(log.includes("error")).to.be.false;      // log level "nothing" prevents also errors from being logged
expect(log.includes("whatever")).to.be.false;   // only log levels are meaningful

expect(log.writer).not.be.undefined;            // can be replaced to redirect the output elsewhere...

try {
    log.level = "whatever";
    expect.fail();
} catch (ignored) {
}