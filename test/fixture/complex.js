const log = require("tiny-node-logger");

log`with numbers: ${1} ${2}, objects: ${{a:1, b:"2"}}, arrays: ${[1, 2, 3]} and exceptions: ${new Error("message!")}`;

log("...also with functional notation: ", 123, "456");

log.info`${"just a corner case in the logic"}`;