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

### Usage
```javascript
const log = require("tiny-node-logger");

log.level = "trace";

log.trace("Hello world!");
log.debug("Hello world!");
log.info("Hello world!");
log.warn("Hello world!");
log.error("Hello world!");
```
produces the following output:

![colored log output](https://github.com/glromeo/tiny-node-logger/blob/master/sample.png?raw=true)

#### References

[https://maketext.io/](https://maketext.io/)
