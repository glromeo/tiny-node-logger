const sinon = require('sinon');
const {expect} = require('chai');

global.expect = expect;

function rerequire(id) {
    const resolved = require.resolve(id);
    delete require.cache[resolved];
    return require(resolved);
}

function useFakeTimers() {
    return sinon.useFakeTimers();
}

function restoreRealTimers() {
    sinon.restore();
}

function schedule(fn, timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try { resolve(fn()); } catch (e) { reject(e); }
        }, timeout);
    });
}

module.exports = {rerequire, useFakeTimers, restoreRealTimers, schedule};
