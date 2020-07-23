describe("tiny node logger", function () {

    const chalk = require("chalk");

    const log = require("tiny-node-logger");
    const {
        colors,
        trace,
        debug,
        info,
        warn,
        error,
        stringify
    } = log;

    let toISOString;

    beforeEach(function () {
        log.write = jest.fn();
        let instant = 0;
        toISOString = global.Date.prototype.toISOString;
        global.Date.prototype.toISOString = jest.fn().mockImplementation(() => {
            return "1974-04-12T08:30:00."+String(instant++).padStart(3, "0");
        });
    });

    afterEach(function () {
        global.Date.prototype.toISOString = toISOString;
    });

    it("simplest", function () {
        log`hello world`;
        expect(log.write).toBeCalledWith(`[${chalk.blue("1974-04-12 08:30:00.000")}] hello world\n`);
    });

    it("colors", function () {
        expect(colors.default).toStrictEqual("black");
        expect(colors.trace).toStrictEqual("gray");
        expect(colors.debug).toStrictEqual("green");
        expect(colors.info).toStrictEqual("black");
        expect(colors.warn).toStrictEqual("yellow");
        expect(colors.error).toStrictEqual("red");
        expect(colors.timestamp).toStrictEqual("blue");
    });

    it("levels", function () {

        expect(log.level).toStrictEqual("info");
        log.level = "warn";
        expect(log.level).toStrictEqual("warn");
        log.level = "error";
        expect(log.level).toStrictEqual("error");
        log.level = "nothing";
        expect(log.level).toStrictEqual("nothing");
        log.level = "debug";
        expect(log.level).toStrictEqual("debug");

        expect(() => log.level = "unknown").toThrowError("cannot set level: unknown");
        expect(() => log.level = NaN).toThrowError("cannot set level: NaN");

        log.level = "info";
        expect(log.level).toStrictEqual("info");

        log.info("info");
        expect(log.write).toBeCalledTimes(1);
        log.debug("debug");
        expect(log.write).toBeCalledTimes(1);
        log.error("error");
        expect(log.write).toBeCalledTimes(2);
    });

    it("logging (classic)", function () {

        log.info("info", 123);

        expect(log.write).toHaveBeenNthCalledWith(1, `[${chalk.blue("1974-04-12 08:30:00.000")}] ${chalk.black("info")} 123\n`);

        log.debug("debug");
        expect(log.write).toBeCalledTimes(1);

        log.warn("warning", {a: 0}, {e1: {e2: {e3: {e4: {e5: 0}}}}}, new Error("any error"));

        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(`[${chalk.blue("1974-04-12 08:30:00.001")}] `));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` ${chalk.yellow("warning")} {`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` { a: ${chalk.yellow("0")} } {`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` Error: any error\n    at Object.<anonymous> (`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` {\n  e1: { e2: { e3: { e4: ${chalk.cyan("[Object]")} } } }\n} `));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringMatching(/[\n]$/));

        log.trace("trace");
        expect(log.write).toBeCalledTimes(2);
    });

    it("logging (tagged template)", function () {

        log.level = "TRACE";

        expect(log.level).toBe("trace");

        trace`trace ${123} ${chalk.green("green")} `;

        expect(log.write).toHaveBeenNthCalledWith(1, `[${chalk.blue("1974-04-12 08:30:00.000")}] ${chalk.gray("trace ")}123 ${chalk.green("green")} \n`);
        expect(log.write).toBeCalledTimes(1);

        debug`debug`;

        expect(log.write).toHaveBeenNthCalledWith(2, `[${chalk.blue("1974-04-12 08:30:00.001")}] ${chalk.green("debug")}\n`);

        warn`${{a: 0}}, ${new Error("any error")} ${{e1: {e2: {e3: {e4: {e5: 0}}}}}}`;

        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringContaining(`[${chalk.blue("1974-04-12 08:30:00.002")}] `));
        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringContaining(`{ a: ${chalk.yellow("0")} }`));
        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringContaining(`}${chalk.yellow(", ")}Error`));
        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringContaining(`Error: any error\n    at Object.<anonymous> (`));
        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringContaining(` {\n  e1: { e2: { e3: { e4: ${chalk.cyan("[Object]")} } } }\n}`));
        expect(log.write).toHaveBeenNthCalledWith(3, expect.stringMatching(/[\n]$/));

        info`info`;
        error`error`;

        expect(log.write).toBeCalledTimes(5);
    });

    it("logging nothing", function () {

        global.Date = class {
            toISOString() {
                fail("shouldn't call timestamp()");
            }
        };

        let count = 0;

        log.level = log.NOTHING;

        log.trace`it doesn't matter`;
        log.debug`it doesn't matter`;
        log.info`it doesn't matter`;
        log.warn`it doesn't matter`;
        log.error`it doesn't matter`;

        expect(log.write).not.toHaveBeenCalled();
    });

    it("stringify", function () {
        expect(stringify("something", "black")).toBe(chalk.black("something"));
        expect(stringify("something", null)).toBe("something");
        expect(stringify("something")).toBe("something");
    });

    it("can log timestamp, file and line number ( lines and columns don't quite match because of jest )", function () {

        expect(log.details).toBe(false);

        log.setLevel("info");
        log.details = true;

        log.info("details enabled!");
        log.warn("details enabled!");
        log.error("details enabled!");

        expect(log.write).toHaveBeenNthCalledWith(1,
            `[${chalk.blue("1974-04-12 08:30:00.000")}] unit.test.js (144:9) ${chalk.black("details enabled!")}\n`
        );
        expect(log.write).toHaveBeenNthCalledWith(2,
            `[${chalk.blue("1974-04-12 08:30:00.001")}] unit.test.js (145:9) ${chalk.yellow("details enabled!")}\n`
        );
        expect(log.write).toHaveBeenNthCalledWith(3,
            `[${chalk.blue("1974-04-12 08:30:00.002")}] unit.test.js (146:9) ${chalk.red("details enabled!")}\n`
        );

        log.details = false;

        log.info("details disabled!");

        expect(log.write).toHaveBeenNthCalledWith(4, `[${chalk.blue("1974-04-12 08:30:00.003")}] ${chalk.black("details disabled!")}\n`);
    });
});
