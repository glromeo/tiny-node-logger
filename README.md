<p align="center">
    <img alt="tiny-node-logger" src="https://raw.githubusercontent.com/glromeo/tiny-node-logger/main/logo.svg">
</p>

Just because I want to read a log that doesn't hurt the eyes!

## Features

* Zero dependencies 👌
* Colored **log levels** for ⚪ TRACE, 🔵 DEBUG, ⚫ INFO, 🟡 WARN and 🔴 ERROR
* Timestamps and flags to easily spot warnings (!) and errors (X)
* Uses [Virtual Terminal](https://docs.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences) 
  control sequences
* Right aligned **filename** & **line numbers** just like in devtools
* Handles nicely the logging of objects using `util` inspect
* Daily inspiring quotes 🤦‍♂️

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
