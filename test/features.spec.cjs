const {rerequire} = require("./setup.cjs");
const sinon = require("sinon");
const {expect} = require("chai");
const fs = require("fs");
const path = require("path");

describe("features", () => {

    before(() => {
        sinon.restore(); // logging.spec.cjs fakes timers without restoring them
    });

    describe("file appender threshold", () => {
        const testFile = path.join(__dirname, "test-features.log");

        beforeEach(() => {
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });

        afterEach(() => {
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });

        it("should filter messages below threshold", done => {
            const logging = rerequire("tiny-node-logger");
            logging.appender = {file: testFile, threshold: "ERROR"};

            const log = logging.logger("features");
            log.info("should not appear");
            log.error("should appear");

            setTimeout(() => {
                const content = fs.readFileSync(testFile, "utf8");
                expect(content).to.not.include("should not appear");
                expect(content).to.include("should appear");
                done();
            }, 100);
        });
    });
});
