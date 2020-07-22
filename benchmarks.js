const Benchmark = require("benchmark");
const log = require("./index.js");

let text, next = "";

log.write = function (item) {
    next = next + item;
    if (item === "\n") {
        text = next;
        next = "";
    }
};

new Benchmark.Suite("tiny-node-logger")

    .add("simple", function () {
        log.info("hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
    })

    .add("tagged templates ...", function () {
        log.info`hello world! ${123456} ${new Date()} ${{abc: 123}}${new Error()}`;
    })

    .add("detailed", function () {
        log.info("hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
    })

    .add("detailed tagged templates", function () {
        log.info`hello world! ${123456} ${new Date()} ${{abc: 123}}${new Error()}`;
    })

    .on("cycle", function ({target}) {
        console.log(target.toString());
        if (target.name.endsWith("...")) {
            log.details = true;
            console.log("switched to details mode...");
        }
    })

    .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
    })

    .run({"async": true});