import log from "../src/index";
import {mockquire, sinon, unrequire} from "mocha-toolkit";
import {readdirSync, readFileSync, writeFileSync} from "fs";
import {resolve} from "path";
import {fail} from "assert";

describe("tiny-node-logger", function () {

    before(function () {
        this.clock = sinon.useFakeTimers({
            now: 0,
            shouldAdvanceTime: false
        });
        this.logger = mockquire("tiny-node-logger", require("../lib/index"), {paths: ["/"]});
        this.logger("ready");
    })

    it("goes through the fixtures and makes sure that their output matches the snapshots", function () {

        const fixtures = readdirSync(resolve(__dirname, "./fixture")).map(filename => {
            return filename.substring(0, filename.lastIndexOf("."));
        });

        [60, 120].forEach(columns => {

            process.stdout.columns = columns;

            for (const fixture of fixtures) {
                let output = "";
                this.logger.writer = function (text: string): boolean {
                    output += text;
                    return true;
                };
                this.logger.level = "info";
                try {
                    const request = `./fixture/${fixture}`;
                    unrequire(request)
                    require(request);
                } catch (e) {
                    fail(e);
                } finally {
                    const path = resolve(__dirname, `./snapshot/${fixture}.w${columns}`);
                    try {
                        expect(output).to.eq(readFileSync(path, {encoding: "utf8"}));
                    } catch (error) {
                        if (error.code === 'ENOENT') {
                            writeFileSync(path, output);
                        } else {
                            fail(error);
                        }
                    }
                }
            }
        });
    })

    it("script", function () {
        process.stdout.columns = 120;
        this.logger.writer = function (text: string) {
            expect(text).to.equal(
                '\x1b[90m' +
                '00:00:00.000' +
                ' ' +
                '\x1b[104m' +
                ' ' +
                '\x1b[39m\x1b[49m' +
                ' ' +
                'Hello World' +
                ' ' +
                '\x1b[112G\x1b[90m' +
                'unknown' +
                '\x1b[30m' +
                ':' +
                '\x1b[94m4\x1b[39m' +
                '\n'
            );
        };
        new Function("log", `
            log.info("Hello World");
        `)(this.logger);
    })
});
