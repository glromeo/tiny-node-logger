![logo](https://github.com/glromeo/tiny-node-logger/blob/master/logo.svg?raw=true)

Because I needed a small and simple library to be used in **node.js** for looking at a console log that doesn't hurt!
##### Features
* Syntax coloring
* Log call site details: filename, line number and column
* Can be used as functions or as tagged templates

[![Build Status](https://travis-ci.org/glromeo/tiny-node-logger.svg?branch=master)](https://travis-ci.org/glromeo/tiny-node-logger)
[![Coverage Status](https://coveralls.io/repos/github/glromeo/tiny-node-logger/badge.svg?branch=master)](https://coveralls.io/github/glromeo/tiny-node-logger?branch=master) 
[![Downloads](https://badgen.net/npm/dt/tiny-node-logger)](https://www.npmjs.com/package/tiny-node-logger) 
[![npm dependents](https://badgen.net/npm/dependents/tiny-node-logger)](https://www.npmjs.com/package/tiny-node-logger?activeTab=dependents)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
![TypeScript-ready](https://img.shields.io/npm/types/tiny-node-logger.svg) 
[![run on repl.it](https://repl.it/badge/github/glromeo/tiny-node-logger)](https://repl.it/github/glromeo/tiny-node-logger)

### Install
```bash
npm i tiny-node-logger
```

### Example
As simple as it gets...
```javascript
const log = require("tiny-node-logger");

log`Hello world!`
```

Using tagged templates
```javascript
const {trace, debug, info, warn, error, setLevel} = require("tiny-node-logger");

setLevel("trace"); // otherwise defaults to "info"

trace`Hello world!`
debug`Hello world!`
info`Hello world!`
warn`Hello world!`
error`Hello world!`
```
produces the following output:

![colored log output](https://github.com/glromeo/tiny-node-logger/blob/master/images/example-plain.png?raw=true)

### Another example
Here we enabled the details and we use function calls just to show that they are an alternative.
```javascript
  1 |  const log = require("tiny-node-logger");
  2 |  
  3 |  log.level = "trace";
  4 |  
  5 |  log.details = true;
  6 |  
  7 |  log.trace("Hello world!");
  8 |  log.debug("Hello world!");
  9 |  log.info("Hello world!");
 10 |  log.warn("Hello world!");
 11 |  log.error("Hello world!");
```
produces the following output:

![colored log output](https://github.com/glromeo/tiny-node-logger/blob/master/images/example-with-details.png?raw=true)

### Benchmarks
```
console.log x 1,494 ops/sec ±0.91% (81 runs sampled)
simple x 1,426 ops/sec ±1.01% (88 runs sampled)
tagged templates x 1,487 ops/sec ±1.22% (86 runs sampled)
detailed x 1,362 ops/sec ±0.83% (84 runs sampled)
detailed tagged templates x 1,420 ops/sec ±0.85% (86 runs sampled)
```
Oddly, it seems that tagged templates are faster ...but not by much.
> The log library is practically as fast as console.log and the impact of enabling the details negligible in comparison to the cost of the write operations

#### References

* Coloured thanks to: [https://github.com/chalk/chalk](https://github.com/chalk/chalk)
* Logo created using: [https://maketext.io](https://maketext.io)
* Details extracted using: [https://v8.dev/docs/stack-trace-api](https://v8.dev/docs/stack-trace-api)
