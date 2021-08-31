const Benchmark = require("benchmark");
const log = require("./lib");
const readline = require("readline");

log.writer = function (item) {
    process.stdout.write("\x1B[H" + item);
};

const outcomes = [];

new Benchmark.Suite("tiny-node-logger")
    .add("console.log", function () {
        console.log("\x1B[H" + "hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
    })
    .add("simple", function () {
        log.info("hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
    })
    .add("tagged templates ...", function () {
        log.info`hello world! ${123456} ${new Date()} ${{abc: 123}}${new Error()}`;
    })
    .on("cycle", function ({target}) {
        outcomes.push(target.toString());
    })
    .on("complete", function () {
        console.log("\x1B[2J");
        readline.clearScreenDown(process.stdout, () => {
            outcomes.forEach(outcome=>console.log(outcome));
            console.log("Fastest is " + this.filter("fastest").map("name"));
        });
    })
    .run({"async": true});