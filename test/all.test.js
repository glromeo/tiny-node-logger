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

describe("tiny node logger", function () {

    log.write = jest.fn();

    beforeEach(function () {
        log.write.mockReset();
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
        expect(log.write).toBeCalledTimes(4); // timestamp, details "", "info", "\n"
        log.debug("debug");
        expect(log.write).toBeCalledTimes(4); // count stays same because debug is ignored
        log.error("error");
        expect(log.write).toBeCalledTimes(8); // count is doubled because of error


    });

    it("logging (classic)", function () {

        let instants = [
            "2020-06-10T11:51:59.101",
            "2020-06-10T11:51:59.102"
        ], instant = 0;

        global.Date = class {
            toISOString() {
                return instants[instant++];
            }
        };

        let count = 0;

        log.info("info", 123);

        for (const arg of [
            `[${chalk.blue("2020-06-10 11:51:59.101")}] `,
            "",
            chalk.black("info"),
            " ",
            "123",
            "\n"
        ]) expect(log.write).toHaveBeenNthCalledWith(++count, arg);
        expect(log.write).toBeCalledTimes(count);

        log.debug("debug");
        expect(log.write).toBeCalledTimes(count);

        log.warn("warning", {a: 0}, new Error("any error"), {e1: {e2: {e3: {e4: {e5: 0}}}}});

        for (const arg of [
            `[${chalk.blue("2020-06-10 11:51:59.102")}] `,
            "",
            chalk.yellow("warning"),
            " ",
            `{ a: ${chalk.yellow("0")} }`,
            " ",
            expect.stringContaining("Error: any error"),
            " ",
            `{\n  e1: { e2: { e3: { e4: ${chalk.cyan("[Object]")} } } }\n}`,
            "\n"
        ]) expect(log.write).toHaveBeenNthCalledWith(++count, arg);
        expect(log.write).toBeCalledTimes(count);
    });

    it("logging (tagged template)", function () {

        let instants = [
            "2020-06-10T11:51:59.101",
            "2020-06-10T11:51:59.102",
            "2020-06-10T11:51:59.103"
        ], instant = 0;

        global.Date = class {
            toISOString() {
                return instants[instant++];
            }
        };

        let count = 0;

        log.level = "trace";

        log.trace`info ${123} ${chalk.green("green")} `;

        for (const arg of [
            `[${chalk.blue("2020-06-10 11:51:59.101")}] `,
            "",
            chalk.gray("info "),
            "123",
            " ",
            chalk.green("green"),
            " ",
            "\n"
        ]) expect(log.write).toHaveBeenNthCalledWith(++count, arg);
        expect(log.write).toBeCalledTimes(count);

        log.debug`debug`;

        for (const arg of [
            `[${chalk.blue("2020-06-10 11:51:59.102")}] `,
            "",
            chalk.green("debug"),
            "\n"
        ]) expect(log.write).toHaveBeenNthCalledWith(++count, arg);

        log.warn`${{a: 0}}, ${new Error("any error")} ${{e1: {e2: {e3: {e4: {e5: 0}}}}}}`;

        for (const arg of [
            `[${chalk.blue("2020-06-10 11:51:59.103")}] `,
            "",
            `{ a: ${chalk.yellow("0")} }`,
            chalk.yellow(", "),
            expect.stringContaining("Error: any error"),
            " ",
            `{\n  e1: { e2: { e3: { e4: ${chalk.cyan("[Object]")} } } }\n}`,
            "\n"
        ]) expect(log.write).toHaveBeenNthCalledWith(++count, arg);
        expect(log.write).toBeCalledTimes(count);
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
        expect(stringify("something")).toBe(chalk.black("something"));
    });

    it("can log file and line number", function () {

        let instants = [
            "2020-06-10T11:51:59.101",
            "2020-06-10T11:51:59.102",
            "2020-06-10T11:51:59.103"
        ], instant = 0;

        global.Date = class {
            toISOString() {
                return instants[instant++];
            }
        };

        log.setLevel("info");
        log.details = true;

        log.info("details enabled!");

        expect(log.write).toHaveBeenNthCalledWith(2, "all.test.js (153:9) ");
        expect(log.write).toHaveBeenNthCalledWith(3, chalk.black("details enabled!"));

        log.details = false;

        log.info("details disabled!");

        expect(log.write).toHaveBeenNthCalledWith(6, "");
        expect(log.write).toHaveBeenNthCalledWith(7, chalk.black("details disabled!"));
    });
});
