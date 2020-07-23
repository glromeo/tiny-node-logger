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

    beforeEach(function () {
        log.write = jest.fn();
        global.Date.toISOString = jest.fn();
    });

    afterEach(function () {
    });

    function feedISODates(...dates) {
        let instant = 0;
        global.Date.toISOString.mockImplementation(function () {
            return dates[instant++];
        })
    }

    it("simplest", function () {
        feedISODates(
            "2020-06-10T11:51:59.101"
        );
        log`hello world`;
        expect(log.write).toBeCalledWith("hello world\n");
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

        expect(log.level.description).toStrictEqual("info");
        log.level = log.WARN;
        expect(log.level.description).toStrictEqual("warn");
        log.level = log.ERROR;
        expect(log.level.description).toStrictEqual("error");
        log.level = log.NOTHING;
        expect(log.level.description).toStrictEqual("nothing");
        log.level = log.DEBUG;
        expect(log.level.description).toStrictEqual("debug");

        expect(() => log.level = "unknown").toThrowError("cannot set level: unknown");

        log.level = "info";
        expect(log.level.description).toStrictEqual("info");

        log.info("info");
        expect(log.write).toBeCalledTimes(1);
        log.debug("debug");
        expect(log.write).toBeCalledTimes(1);
        log.error("error");
        expect(log.write).toBeCalledTimes(2);
    });

    it("logging (classic)", function () {

        log.info("info", 123);

        expect(log.write).toHaveBeenNthCalledWith(1, `${chalk.black("info")} 123\n`);

        log.debug("debug");
        expect(log.write).toBeCalledTimes(1);

        log.warn("warning", {a: 0}, {e1: {e2: {e3: {e4: {e5: 0}}}}}, new Error("any error"));

        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(`${chalk.yellow("warning")} {`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` { a: ${chalk.yellow("0")} } {`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` Error: any error\n    at Object.<anonymous> (`));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringContaining(` {\n  e1: { e2: { e3: { e4: ${chalk.cyan("[Object]")} } } }\n} `));
        expect(log.write).toHaveBeenNthCalledWith(2, expect.stringMatching(/[\n]$/));

        log.trace("trace");
        expect(log.write).toBeCalledTimes(2);
    });

    it("logging (tagged template)", function () {

        log.level = "trace";

        trace`trace ${123} ${chalk.green("green")} `;

        expect(log.write).toHaveBeenNthCalledWith(1, `${chalk.gray("trace ")}123 ${chalk.green("green")} \n`);
        expect(log.write).toBeCalledTimes(1);

        debug`debug`;

        expect(log.write).toHaveBeenNthCalledWith(2, `${chalk.green("debug")}\n`);

        warn`${{a: 0}}, ${new Error("any error")} ${{e1: {e2: {e3: {e4: {e5: 0}}}}}}`;

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

    it("can log timestamp, file and line number ( 18 lines offset because of jest :( )", function () {

        let instants = [
            "2020-06-10T11:51:59.101",
            "2020-06-10T11:51:59.102",
            "2020-06-10T11:51:59.103",
            "2020-06-10T11:51:59.104"
        ], instant = 0;

        global.Date = class {
            toISOString() {
                return instants[instant++];
            }
        };

        expect(log.details).toBe(false);

        log.setLevel("info");
        log.details = true;

        log.info("details enabled!");
        log.warn("details enabled!");
        log.error("details enabled!");

        expect(log.write).toHaveBeenNthCalledWith(1,
            `[${chalk.blue("2020-06-10 11:51:59.101")}] all.test.js (${164 - 19}:9) ${chalk.black("details enabled!")}\n`
        );
        expect(log.write).toHaveBeenNthCalledWith(2,
            `[${chalk.blue("2020-06-10 11:51:59.102")}] all.test.js (${165 - 19}:9) ${chalk.yellow("details enabled!")}\n`
        );
        expect(log.write).toHaveBeenNthCalledWith(3,
            `[${chalk.blue("2020-06-10 11:51:59.103")}] all.test.js (${166 - 19}:9) ${chalk.red("details enabled!")}\n`
        );

        log.details = false;

        log.info("details disabled!");

        expect(log.write).toHaveBeenNthCalledWith(4, `${chalk.black("details disabled!")}\n`);
    });
});
