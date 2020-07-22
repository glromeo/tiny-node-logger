
function getStackTrace(error, stack) {
    return stack;
}

function getCallSite() {
    const stackTraceLimit = Error.stackTraceLimit;
    const prepareStackTrace = Error.prepareStackTrace;
    Error.stackTraceLimit = 10;
    Error.prepareStackTrace = getStackTrace;
    const {stack} = new Error();
    Error.prepareStackTrace = prepareStackTrace;
    Error.stackTraceLimit = stackTraceLimit;
    return stack[3];
}

const path = require("path");

module.exports = function () {
    const callSite = getCallSite();
    const basename = path.basename(callSite.getFileName());
    const lineNumber = callSite.getLineNumber();
    const columnNumber = callSite.getColumnNumber();
    return `${basename} (${lineNumber}:${columnNumber}) `;
}