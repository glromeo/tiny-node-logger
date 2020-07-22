const {trace, debug, info, warn, error, setLevel} = require("../index.js");

setLevel("trace"); // otherwise defaults to "info"

trace`Hello world!`
debug`Hello world!`
info`Hello world!`
warn`Hello world!`
error`Hello world!`
