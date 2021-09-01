<p align="center">
    <img alt="tiny-node-logger" src="https://raw.githubusercontent.com/glromeo/tiny-node-logger/main/logo.svg">
</p>
<hr>
<h3 align="center">
Just because I wanted to read a log that doesn't hurt my eyes!!! 👀
</h3>
<hr>

## Features

* 100% test coverage
* Zero dependencies 👌
* Colored **log levels** for ⚪ TRACE, 🔵 DEBUG, ⚫ INFO, 🟡 WARN and 🔴 ERROR
* Timestamps and flags to easily spot warnings (!) and errors (X)
* Right aligned **filename** & **line numbers** just like in devtools
* Handles nicely the logging of objects using `util` inspect
* Daily inspiring quotes 🤦‍♂️

[![Build Status](https://app.travis-ci.com/glromeo/tiny-node-logger.svg?branch=main)](https://app.travis-ci.com/glromeo/tiny-node-logger)
[![Downloads](https://badgen.net/npm/dt/tiny-node-logger)](https://www.npmjs.com/package/tiny-node-logger)
[![run on repl.it](https://repl.it/badge/github/glromeo/tiny-node-logger)](https://repl.it/github/glromeo/tiny-node-logger)

## Install

```bash
npm install tiny-node-logger
```

## Usage

### Simple
```javascript
const log = require("tiny-node-logger");

// You can either use the logger as a function...

log("Hello world");

// ...or as a tagged template

log`Hello world`;
```

### Levels
```javascript
const {
  trace, debug, info, warn, error
} = log;

log.level = "trace";

trace`this is a trace message`;
debug`this is a debug message`;
info`this is an info message`;
warn`this is a warn message`;
error`this is an error message`;
```
*To just use `log(...)` is similar to use `log.info(...)` but it ignores any threshold set by `log.level`.*

For more examples please look in the [fixture](https://github.com/glromeo/tiny-node-logger/tree/main/test/fixture) folder

## Colors & Layout

Coloring and layout are done using [Virtual Terminal](https://docs.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences) control sequences.\
The output has been verified on:
  * Windows 11 **Command Prompt**, **PowerShell** and **Git bash**
  * MacOS **Terminal**
  * Linux (via WSL/2 Ubuntu's **bash**)

## Benchmark
```
console.log x 1,655 ops/sec ±4.35% (77 runs sampled)
simple x 1,596 ops/sec ±3.63% (85 runs sampled)
tagged templates ... x 1,465 ops/sec ±4.88% (75 runs sampled)

Fastest is console.log ...BUT NOT BY MUCH!!!
```

## Credits

* Logo created using [maketext.io](https://maketext.io)
* Filename & line number extracted with [v8 stack-trace-api](https://v8.dev/docs/stack-trace-api)
* HTML snapshots generated using [ansi-to-html](https://github.com/rburns/ansi-to-html)
