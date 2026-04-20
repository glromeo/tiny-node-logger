# tiny-node-logger

<p align="center">
    <img alt="tiny-node-logger" src="https://raw.githubusercontent.com/glromeo/tiny-node-logger/main/logo.svg">
</p>

A logging library with colored output, timestamps, origin tracking, and modern syntax support.

[![Build Status](https://app.travis-ci.com/glromeo/tiny-node-logger.svg?branch=main)](https://app.travis-ci.com/glromeo/tiny-node-logger)
[![Coverage Status](https://coveralls.io/repos/github/glromeo/tiny-node-logger/badge.svg?branch=main)](https://coveralls.io/github/glromeo/tiny-node-logger?branch=main)
[![Downloads](https://badgen.net/npm/dt/tiny-node-logger)](https://www.npmjs.com/package/tiny-node-logger)

## Another Logger?

Because logs should be easy on the eyes and effortless to use. console does a good job but tiny-node-logger gives you:

- **Colorful, readable output** - Each log level gets its own eye-friendly color scheme
- **Automatic origin tracking** - Know exactly which module produced each log
- **Modern JavaScript syntax** - Full support for template literals and optional chaining
- **Zero-config timestamps** - Every log line knows when it happened
- **Smart date headers** - Day changes are clearly marked, saving space on each line
- **Flexible filtering** - Control verbosity with log levels
- **Customizable output** - Redirect to files, monitoring services, or anywhere you need

## Installation

```bash
npm install tiny-node-logger
```

## Quick Start

Get logging in seconds:

```javascript
const {log} = require('tiny-node-logger')

log('Hello world!')                                                     // log has no filtering, same as console.log

log.trace('Detailed trace information')
log.debug('Debug information')
log.info('General information')
log.warn('Warning message')
log.error('Error message')
```

That's it! Each log automatically includes a timestamp, color-coded level indicator, and source module label.

## Understanding Log Levels

Choose the right verbosity for your needs. The library supports six log levels, from most detailed to completely silent:

| Level  | Constant  | Numeric Value | Description                               |
|--------|-----------|---------------|-------------------------------------------|
| TRACE  | `TRACE`   | 4             | Most verbose - detailed trace information |
| DEBUG  | `DEBUG`   | 3             | Debug-level messages                      |
| INFO   | `INFO`    | 2             | General informational messages (default)  |
| WARN   | `WARN`    | 1             | Warning messages                          |
| ERROR  | `ERROR`   | 0             | Error messages                            |
| SILENT | `NOTHING` | -1            | No output at all                          |

### Verbosity

Adjust what gets logged based on your environment. Use constants for type safety, strings values, or level numbers if
you prefer:

```javascript
const {log, levels: {TRACE, DEBUG, INFO, WARN, ERROR, NOTHING}} = require('tiny-node-logger')

// Using constants (recommended for code)
log.level = TRACE    // Everything
log.level = INFO     // Default - info, warn, error
log.level = NOTHING  // Complete silence

// Using strings (great for config files)
log.level = 'trace'
log.level = 'info'
log.level = 'silent'

// Using numbers (if that's your thing)
log.level = 4  // trace
log.level = 2  // info
log.level = -1 // silent
```

### Checking Log Levels

Check if a specific log level is enabled before performing expensive operations. Each log method has an `enabled` property
that returns the function if enabled, or `null` if disabled:

```javascript
const {log} = require('tiny-node-logger')

log.level = 'info'

// Check which levels are enabled
console.log(log.trace.enabled)  // null (disabled)
console.log(log.debug.enabled)  // null (disabled)
console.log(log.info.enabled)   // [Function] (enabled)
console.log(log.warn.enabled)   // [Function] (enabled)
console.log(log.error.enabled)  // [Function] (enabled)

// Use it to conditionally execute expensive operations
if (log.debug.enabled) {
    const debugData = expensiveDebugCalculation()
    log.debug('Debug data:', debugData)
}
```

### Optional Chaining

Avoid expensive operations when logging is disabled. Each log method has a `maybe` property that uses optional chaining
to skip both the log call and its arguments when the level isn't active:

```javascript
const {log} = require('tiny-node-logger')

log.level = 'info'

// These will log (info level includes info, warn, and error)
log.info.maybe?.('Processing request')
log.warn.maybe?.('Rate limit approaching')
log.error.maybe?.('Connection failed')

// These won't run at all (trace and debug are disabled)
log.trace.maybe?.('This never executes')
log.debug.maybe?.('Neither does this')
```

Why is this useful? Because you can skip expensive operations entirely:

```javascript
// the JSON serialization only happens if debug is enabled
log.debug.maybe?.(JSON.stringify(massiveObject))

// This computationally expensive function only runs when trace is on
log.trace.maybe?.(`Stats: ${calculateDetailedMetrics()}`)

// Without maybe, these would always run even if logging is disabled:
log.debug(JSON.stringify(massiveObject))  // JSON.stringify always runs!
```

**NOTE:** never forget **?.** when using maybe or changing the level the code will break!

## Template Literals

Love template literals? So do we. Use them as tagged templates for clean, readable logs:

```javascript
const {log} = require('tiny-node-logger')

const user = 'Alice'
const count = 42
const status = {active: true, premium: false}

// Clean interpolation with template literals
log.info`User ${user} has ${count} items`

// Works at every level
log.debug`Processing ${count} records`
log.warn`User ${user} exceeded quota`

// Objects get beautifully formatted
log.trace`User status: ${status}`
```

**NOTE:** tagged templated don't allow **?.** so you can't use maybe this way

## Organizing Logs by Component

Working on a large application? Create dedicated loggers for different parts of your codebase. Each logger can have its
own label to make filtering and debugging easier:

```javascript
const {logger} = require('tiny-node-logger')

const dbLogger = logger('database')
const apiLogger = logger('api/v1')
const cacheLogger = logger('cache')

dbLogger.info('Connection pool initialized')
apiLogger.debug('Request received from client')
cacheLogger.warn('Cache miss for key: user:123')
```

**Pro tip:** The default `log` instance is smart enough to automatically detect and display your module name based on
your package.json, so you get source tracking without any manual setup.

## Beyond the Terminal

Need to send logs somewhere other than stdout? You have two ways to customize output: the `writer` for raw output control,
or `appender` for formatted log line processing.

### Custom Writer

Override the writer to redirect the raw output stream to files, monitoring services, or anywhere else:

```javascript
const logging = require('tiny-node-logger')
const fs = require('fs')

// Write to a file instead
const fileStream = fs.createWriteStream('app.log', {flags: 'a'})
logging.writer = (line) => fileStream.write(line)

// Send to a monitoring service
const {stripAnsi} = require('tiny-node-logger')
logging.writer = (line) => {
    // Strip ANSI color codes before sending
    const stripped = stripAnsi(line)
    monitoringService.send(stripped)
}

// Split output between console and file
const originalWriter = logging.writer
logging.writer = (line) => {
    originalWriter(line)  // Still show in terminal
    fileStream.write(line)  // Also save to file
}
```

### Custom Appender

For more control over log formatting, override the `appender`. An appender receives the log level, origin, and message
chunks before they're formatted into a line:

```javascript
const logging = require('tiny-node-logger')

// Single custom appender function
logging.appender = (level, origin, chunks) => {
    // level: the formatted log level string (with ANSI codes)
    // origin: the module name (e.g., 'tiny-node-logger')
    // chunks: array of log arguments/chunks
    const message = chunks.join(' ')
    console.log(`[${origin || 'app'}] ${message}`)
}

// File appender - simple string path
logging.appender = 'app.log'  // Logs everything (TRACE level)

// File appender with threshold - only log warnings and errors
logging.appender = {
    file: 'errors.log',
    threshold: 'WARN',  // Only WARN and ERROR
    flags: 'a'          // Append mode (default)
}

// Multiple appenders with different thresholds
logging.appender = [
    'terminal',  // Console output (all levels)
    'debug.log', // File with all logs
    {
        file: 'errors.log',
        threshold: 'ERROR'  // Only errors to this file
    },
    {
        file: 'important.log',
        threshold: 'WARN'   // Warnings and errors
    }
]

// Mix custom functions with file appenders
const {stripAnsi, stringify} = require('tiny-node-logger')

logging.appender = [
    'terminal',  // Default console output
    {
        file: 'app.log',
        threshold: 'INFO'  // Info, warn, and error to file
    },
    // Custom appender for monitoring service
    (level, origin, chunks) => {
        const message = chunks.map(c => {
            const str = typeof c === 'string' ? c : JSON.stringify(c)
            return stripAnsi(str)
        }).join(' ')
        monitoringService.send({level, origin, message})
    }
]
```

**Appender Configuration Options:**

- **Function**: Custom appender function `(level, origin, chunks) => void`
- **String**:
  - `"terminal"` - Use default console output
  - File path - Creates file appender with TRACE threshold
- **Object**: File appender configuration
  - `file` (required) - Path to log file
  - `threshold` (optional) - Minimum log level (TRACE, DEBUG, INFO, WARN, ERROR). Default: TRACE
  - `flags` (optional) - File system flags. Default: 'a' (append)

## Using Colors

Color constants are available for use in your own console output. Each constant applies to all following text until
changed:

```javascript
const {colors, esc} = require('tiny-node-logger')
const {INK, FILL, CLEAR} = colors

console.log(`${INK.RED}Error text${INK.DEFAULT}`)
console.log(`${FILL.YELLOW}Warning background${FILL.DEFAULT}`)

// Mix and match
console.log(`${INK.BRIGHT_GREEN + FILL.BLACK}Success!${INK.DEFAULT + FILL.DEFAULT}`)

// Reset all formatting with CLEAR
console.log(`${INK.RED}${FILL.YELLOW}Formatted text${CLEAR}Back to normal`)

// Create custom ANSI codes with esc()
console.log(`${esc(31)}Red text${esc(39)}`)  // 31 = red, 39 = default
console.log(`${esc('1;32')}Bold green${esc(0)}`)  // 1 = bold, 32 = green, 0 = reset
```

### Color Palette

Both `INK` (foreground text) and `FILL` (background) give you access to:

**Standard colors:** `BLACK`, `RED`, `GREEN`, `YELLOW`, `BLUE`, `MAGENTA`, `CYAN`, `WHITE`

**Bright variants:** `BRIGHT_BLACK`, `BRIGHT_RED`, `BRIGHT_GREEN`, `BRIGHT_YELLOW`, `BRIGHT_BLUE`, `BRIGHT_MAGENTA`,
`BRIGHT_CYAN`, `BRIGHT_WHITE`

**Control codes:** `DEFAULT` (reset to default), `EXTENDED` (for 256-color mode)

**Global reset:** `CLEAR` (resets all formatting including colors, bold, underline, etc.)

### ANSI Escape Codes

The `esc()` function creates ANSI escape sequences for terminal styling. Pass either a number or string to generate the
appropriate escape code:

```javascript
const {esc} = require('tiny-node-logger')

// Single codes
esc(31)      // Red foreground
esc(41)      // Red background
esc(1)       // Bold
esc(0)       // Reset all

// Combined codes (separated by semicolons)
esc('1;31')  // Bold red
esc('4;34')  // Underlined blue
```

### Stripping ANSI Codes

The `stripAnsi()` function removes ANSI escape sequences from strings. It uses an efficient character-by-character scan
instead of regular expressions:

```javascript
const {stripAnsi, colors} = require('tiny-node-logger')
const {INK} = colors

const coloredText = `${INK.RED}Error message${INK.DEFAULT}`
const plainText = stripAnsi(coloredText)  // "Error message"

// Useful for writing to files or services that don't support ANSI
const fs = require('fs')
const logFile = fs.createWriteStream('app.log', {flags: 'a'})
logFile.write(stripAnsi(coloredLogLine))
```

## Inspecting Objects

Need to pretty-print an object? The built-in `stringify` function provides colorized, nested inspection:

```javascript
const {stringify} = require('tiny-node-logger')

const complexObject = {
    user: 'Alice',
    settings: {theme: 'dark', notifications: true},
    tags: ['admin', 'developer']
}

console.log(stringify(complexObject))
// Beautifully formatted, colorized output with 3 levels of depth
```

## What Your Logs Look Like

Here's what you'll see in your terminal:

```
__________________________________________________________________________________________________________________
| Mon Jan 13 2026                                                                                                |
| 12:34:56.789  Hello world!                                                                      @wizkit/server |
| 12:34:56.790  Processing request                                                    @wizkit/server/lib/handler |
| 12:34:56.820  Request processed                                                                              - |
| 12:34:56.851  Rate limit check passed                                            @wizkit/server/lib/middleware |
| ...                                                                                                            |
```

Each line includes:

- **Date header** when the day changes (so you know when logs are from)
- **Precise timestamp** down to the millisecond (HH:MM:SS.mmm)
- **Color-coded level** with visual indicators
- **Your message** (with support for objects, arrays, and template literals)
- **Source label** right-aligned to show which module logged it

## TypeScript

Full type definitions are included out of the box. Get autocomplete, type checking, and IntelliSense for everything:

```typescript
import logging from 'tiny-node-logger'

const { log, levels: {TRACE, DEBUG, INFO}, logger } = logging

// Type-safe level setting
log.level = 'debug'  // ✓ Valid
log.level = DEBUG    // ✓ Also valid
log.level = 'invalid' // ✗ Type error

// All methods are fully typed
log.info('Typed logging')
log.error('Something went wrong:', new Error('details'))

// Maybe property with proper optional types
log.debug.maybe?.('This is type-safe')
log.trace.maybe?.(`Count: ${42}`)

// Enabled property for checking enabled levels
if (log.debug.enabled) {
    log.debug('Debug is enabled')
}

// Custom loggers are typed too
const dbLog = logger('database')
dbLog.level = TRACE
```

---

## Contributing

Found a bug or have a feature request? Open an issue on [GitHub](https://github.com/glromeo/tiny-node-logger/issues).

## License

MIT

## Author

Gianluca Romeo <glromeo@gmail.com>

---

<p align="center">Made with care for developers who appreciate readable logs.</p>
