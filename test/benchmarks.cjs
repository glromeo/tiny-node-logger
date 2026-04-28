const Benchmark = require("benchmark");
const readline = require("readline");
const {log} = require("tiny-node-logger");

const outcomes = [];

new Benchmark.Suite("tiny-node-logger")

    .add("console.log", function () {
        const date = new Date();
        const time = date.toLocaleTimeString();
        const msec = String(date.getMilliseconds()).padStart(3, "0");
        const timestamp = `${"X" + time + "X"}.${msec} ${"Y"}`;
        console.log(timestamp, "hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
        readline.cursorTo(process.stdout, 0, 0);
    })

    .add("simple", function () {
        log.info("hello world!", 123456, "abc", new Date(), {abc: 123}, new Error());
        readline.cursorTo(process.stdout, 0, 0);
    })

    .add("tagged templates ...", function () {
        log.info`hello world! ${123456} ${new Date()} ${{abc: 123}}${new Error()}`;
        readline.cursorTo(process.stdout, 0, 0);
    })

    .on("cycle", function ({target}) {
        outcomes.push(target.toString());
    })

    .on("complete", function () {
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout, () => {
            outcomes.forEach(outcome => console.log(outcome));
            console.log("Fastest is " + this.filter("fastest").map("name"));
        });
    })

    .run({"async": true});
