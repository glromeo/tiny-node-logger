![logo](https://github.com/glromeo/tiny-node-logger/blob/master/logo.svg?raw=true)

A very simple library to be used in **node.js** for having a server side logging that doesn't hurt!
> It comes with colouring and file line numbers... if you want

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

### Example (enabling details)
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
enabling the details has a 25% impact of performance
```
simple x 12,480 ops/sec ±1.64% (90 runs sampled)
tagged templates x 13,341 ops/sec ±0.29% (91 runs sampled)
detailed x 9,646 ops/sec ±0.44% (89 runs sampled)
detailed tagged templates x 9,996 ops/sec ±0.44% (92 runs sampled)

Fastest is tagged templates ...
```

#### References

* Coloured thanks to: [https://github.com/chalk/chalk](https://github.com/chalk/chalk)
* Logo created using: [https://maketext.io](https://maketext.io)
* Details extracted using: [https://v8.dev/docs/stack-trace-api](https://v8.dev/docs/stack-trace-api)
