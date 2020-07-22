![logo](https://github.com/glromeo/tiny-node-logger/blob/master/logo.svg?raw=true)

> A simple, *really simple*, node logging library with some nice features.

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

#### References

[https://maketext.io/](https://maketext.io/)
