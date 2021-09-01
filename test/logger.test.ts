import log from "../src/index";
import {mockquire, sinon, unrequire} from "mocha-toolkit";
import {readdirSync, readFileSync, writeFileSync} from "fs";
import {resolve} from "path";
import {fail} from "assert";
import * as process from "process";
import * as path from "path";

const UPDATE = process.argv[3] === "--update";

/**
 * When running inside the IDE the call sites differ from when running from the console or in CI
 * so we have to filter out the stack trace to make the comparison possible
 *
 * @param text
 */
function sanitize(text: string) {
    return text.split("\n")
        .filter(line => !line.match(/^(\x1b\[90m)? {4}at /))
        .join("\n");
}

describe("tiny-node-logger", function () {

    before(function () {
        this.clock = sinon.useFakeTimers({
            now: 0,
            shouldAdvanceTime: false
        });
        this.logger = mockquire("tiny-node-logger", require("../lib/index"), {paths: ["/"]});
        this.defaultWriter = this.logger.writer;

        const prefix = [];
        this.logger.writer = text => prefix.push(text);
        this.logger("ready");
        this.logger.writer = this.defaultWriter;
        this.prefix = prefix;
    })

    it("date prefix", function () {
        const prefix = this.prefix;
        expect(prefix.length).to.eq(2);
        expect(prefix[0]).to.match(/^\u001b\[31mThu Jan 01 1970\u001b\[39m/);
        expect(prefix[1]).to.match(/^\u001b\[90m00:00:00.000 \u001b\[104m \u001b\[39m\u001b\[49m ready/);
    })

    it("inline script", function () {
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
                '\x1b[94m' +
                '4' +
                '\x1b[39m' +
                '\n'
            );
        };
        new Function("log", `
            log.info("Hello World");
        `)(this.logger);
    })

    it("fixtures", function () {

        const fixtures = readdirSync(resolve(__dirname, "./fixture")).map(filename => {
            return filename.substring(0, filename.lastIndexOf("."));
        });

        [60, 120].forEach(columns => {

            process.stdout.columns = columns;

            for (const fixture of fixtures) {
                let output = "";
                this.logger.writer = function (text: string): boolean {
                    output += sanitize(text);
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
                        if (error.code === 'ENOENT' || UPDATE) {
                            writeFileSync(path, output);
                        } else {
                            fail(error);
                        }
                    } finally {
                        this.logger.writer = this.defaultWriter;
                    }
                }
            }
        });
    })

});
