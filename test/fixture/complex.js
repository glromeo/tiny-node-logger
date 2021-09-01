const log = require("tiny-node-logger");


// either using functions or tagged templates the logger can handle numbers, objects and Errors

log("2 + 2 =", 2 + 2);

log("user:", {name: "Gianluca", id: 123}, "aliases:", ["Romeo", "GL"]);

log("an error occurred", new Error("this is the error message"));


// is equivalent to

log`2 + 2 = ${2 + 2}`;

log`user: ${{name: "Gianluca", id: 123}} aliases: ${["Romeo", "GL"]}`;

log`an error occurred ${new Error("this is the error message")}`;


// and these values can appear anywhere

log`${"at the beginning"} of the statement`;

log`in ${"the middle"} of it`;

log`as well as ${"at the end"}`;


// note that using the functional notation...

log("every", "token", "is", "separated", "from", "the", "adjacent", "with", "a", "space");

// while naturally...

log`${"this"} ${"is"} ${"not"} ${"the"} ${"case"} ${"using"} ${"tagged"} ${"templates"}`;