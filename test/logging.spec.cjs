const {rerequire, useFakeTimers, restoreRealTimers, schedule} = require('./setup.cjs');
const {colors: {INK, FILL, CLEAR}, esc} = require('tiny-node-logger');
const fs = require('fs/promises');

describe('tiny-node-logger', () => {

  const EOL = CLEAR + '\n';

  const TS_DAY = `${INK.RED}Thu Jan 01 1970${EOL}`;
  const TS_TIME = `${INK.BRIGHT_BLACK}00:00:00.000`;

  const L_T = `${FILL.BRIGHT_BLACK} ${INK.BRIGHT_BLACK + FILL.DEFAULT}`;
  const L_D = `${FILL.BLUE} ${INK.BRIGHT_BLUE + FILL.DEFAULT}`;
  const L_I = `${FILL.BRIGHT_BLUE} ${INK.DEFAULT + FILL.DEFAULT}`;
  const L_W = `${INK.BRIGHT_YELLOW + FILL.YELLOW}!${INK.YELLOW + FILL.DEFAULT}`;
  const L_E = `${INK.BRIGHT_RED + FILL.RED}X${INK.RED + FILL.DEFAULT}`;

  let lines = [];

  before(() => {
    useFakeTimers();
  });

  beforeEach(() => {
    lines.length = 0;
  });

  describe('Constants', () => {
    it('should export correct level constants', () => {
      const {levels: {TRACE, DEBUG, INFO, WARN, ERROR, NOTHING}} = require('tiny-node-logger');
      expect(TRACE).to.eq(4);
      expect(DEBUG).to.eq(3);
      expect(INFO).to.eq(2);
      expect(WARN).to.eq(1);
      expect(ERROR).to.eq(0);
      expect(NOTHING).to.eq(-1);
    });

    it('should export color constants', () => {
      const {colors} = require('tiny-node-logger');
      expect(colors.INK.RED).to.eq('\x1B[31m');
      expect(colors.INK.GREEN).to.eq('\x1B[32m');
      expect(colors.FILL.RED).to.eq('\x1B[41m');
      expect(colors.FILL.GREEN).to.eq('\x1B[42m');
    });
  });

  describe('Utility Functions', () => {
    it('esc() should create ANSI escape sequences', () => {
      expect(esc(31)).to.eq('\x1B[31m');
      expect(esc('41')).to.eq('\x1B[41m');
    });

    it('stripAnsi() should remove ANSI escape codes', () => {
      const {stripAnsi} = require('tiny-node-logger');

      expect(stripAnsi('\x1B[31mRed text\x1B[39m')).to.eq('Red text');
      expect(stripAnsi('\x1B[31m\x1B[1mBold Red\x1B[0m')).to.eq('Bold Red');
      expect(stripAnsi('Plain text')).to.eq('Plain text');
      expect(stripAnsi('Hello \x1B[32mworld\x1B[39m!')).to.eq('Hello world!');
      expect(stripAnsi(`${INK.RED}Error${INK.DEFAULT}`)).to.eq('Error');
      expect(stripAnsi(`${FILL.YELLOW}Warning${FILL.DEFAULT}`)).to.eq('Warning');

      const colored = `${INK.BRIGHT_GREEN}Success: ${INK.DEFAULT}Operation completed`;
      expect(stripAnsi(colored)).to.eq('Success: Operation completed');
    });

    it('stringify() should format different types', () => {
      const {stringify} = require('tiny-node-logger');

      const obj = stringify({foo: 'bar'});
      expect(obj).to.include('foo');
      expect(obj).to.include('bar');

      expect(stringify('hello')).to.eq('hello');
      expect(stringify('\x1B[31mred')).to.eq(`${INK.DEFAULT}\x1B[31mred`);
      expect(stringify(' ')).to.eq(`${INK.DEFAULT} `);
      expect(stringify(42)).to.eq(42);
    });
  });

  describe('Logger Configuration', () => {
    beforeEach(() => {
      process.stdout.columns = 0;
      rerequire('tiny-node-logger').writer = lines.push.bind(lines);
    });

    it('should support numeric level setting', () => {
      const {logger, levels: {TRACE, DEBUG, INFO, WARN, ERROR, NOTHING}} = require('tiny-node-logger');
      const log = logger();

      log.level = TRACE;
      expect(log.level).to.eq('trace');
      expect(log.trace.enabled).to.not.eq(null);

      log.level = DEBUG;
      expect(log.level).to.eq('debug');
      expect(log.trace.enabled).to.eq(null);
      expect(log.debug.enabled).to.not.eq(null);

      log.level = INFO;
      expect(log.level).to.eq('info');

      log.level = WARN;
      expect(log.level).to.eq('warn');

      log.level = ERROR;
      expect(log.level).to.eq('error');

      log.level = NOTHING;
      expect(log.level).to.eq('silent');
    });

    it('should throw error for invalid level', () => {
      const {logger} = require('tiny-node-logger');
      const log = logger();

      expect(() => log.level = 'invalid').to.throw('cannot set level: invalid');
      expect(() => log.level = 5).to.throw('cannot set level: 5');
      expect(() => log.level = -2).to.throw('cannot set level: -2');
    });

    it('should support maybe methods', () => {
      const {logger} = require('tiny-node-logger');
      const log = logger();

      log.level = 'info';
      expect(log.trace.maybe).to.eq(null);
      expect(log.debug.maybe).to.eq(null);
      expect(log.info.maybe).to.be.a('function');
      expect(log.warn.maybe).to.be.a('function');
      expect(log.error.maybe).to.be.a('function');

      log.level = 'silent';
      expect(log.error.maybe).to.eq(null);
    });
  });

  describe('Appender and Writer', () => {
    beforeEach(() => {
      process.stdout.columns = 0;
    });

    it('should support custom writer', () => {
      const customLines = [];
      const logging = rerequire('tiny-node-logger');
      logging.writer = customLines.push.bind(customLines);

      const {log} = logging;
      log('test message');

      expect(customLines.length).to.be.greaterThan(0);
      expect(customLines.join('')).to.include('test message');
    });

    it('should support custom appender', () => {
      const appenderCalls = [];
      const logging = rerequire('tiny-node-logger');
      logging.writer = lines.push.bind(lines);

      const customAppender = (level, origin, chunks) => {
        appenderCalls.push({level, origin, chunks});
      };

      logging.appender = customAppender;

      const log = logging.logger('test-origin');
      log('test message');

      expect(appenderCalls).to.have.length(1);
      expect(appenderCalls[0].origin).to.eq('test-origin');
      expect(appenderCalls[0].chunks).to.deep.eq(['test message']);
    });

    it('should support multiple appenders', () => {
      const calls1 = [];
      const calls2 = [];
      const logging = rerequire('tiny-node-logger');

      const appender1 = (level, origin, chunks) => calls1.push({level, origin, chunks});
      const appender2 = (level, origin, chunks) => calls2.push({level, origin, chunks});

      logging.appender = [appender1, appender2];

      const log = logging.logger();
      log('test');

      expect(calls1).to.have.length(1);
      expect(calls2).to.have.length(1);
      expect(calls1[0].chunks).to.deep.eq(['test']);
      expect(calls2[0].chunks).to.deep.eq(['test']);
    });

    it('should get current appender', () => {
      const logging = rerequire('tiny-node-logger');
      const originalAppender = logging.appender;
      expect(originalAppender).to.be.a('function');

      const customAppender = () => {};
      logging.appender = customAppender;
      expect(logging.appender).to.eq(customAppender);
    });

    it('should get current writer', () => {
      const logging = rerequire('tiny-node-logger');
      expect(logging.writer).to.be.a('function');
      const customWriter = () => {};
      logging.writer = customWriter;
      expect(logging.writer).to.eq(customWriter);
    });

  });

  describe('shouldUseOrigin', () => {
    beforeEach(() => {
      lines.length = 0;
    });

    it('should append origin suffix when columns >= 80', () => {
      process.stdout.columns = 80;
      const logging = rerequire('tiny-node-logger');
      logging.writer = lines.push.bind(lines);

      const log = logging.logger('test/suffix');
      log('hello world');

      expect(lines.length).to.eq(2);
      expect(lines[1]).to.include('test/suffix');
    });

    it('should not append origin suffix when columns < 80', () => {
      process.stdout.columns = 79;
      const logging = rerequire('tiny-node-logger');
      logging.writer = lines.push.bind(lines);

      const log = logging.logger('test/suffix');
      log('hello world');

      expect(lines.length).to.eq(2);
      expect(lines[1]).to.not.include('test/suffix');
    });

    it('should not append origin suffix when columns is 0', () => {
      process.stdout.columns = 0;
      const logging = rerequire('tiny-node-logger');
      logging.writer = lines.push.bind(lines);

      const log = logging.logger('test/suffix');
      log('hello world');

      expect(lines.length).to.eq(2);
      expect(lines[1]).to.not.include('test/suffix');
    });
  });

  describe('TTY at 0 cols', () => {

    beforeEach(() => {
      process.stdout.columns = 0;
      rerequire('tiny-node-logger').writer = lines.push.bind(lines);
    });

    it('hello world', () => {
      const {log} = require('tiny-node-logger');
      log('hello world');
      expect(lines).to.have.length(2);
      expect(lines[0]).to.eq(TS_DAY);
      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} hello world${EOL}`);
    });

    it('levels', () => {
      const {log} = require('tiny-node-logger');

      expect(log.level).to.eq('info');
      log.trace('hello world');
      log.debug('hello world');
      expect(lines).to.have.length(0);

      expect(log.trace.enabled).to.eq(null);
      expect(log.debug.enabled).to.eq(null);
      expect(log.info.enabled).to.not.eq(null);
      expect(log.warn.enabled).to.not.eq(null);
      expect(log.error.enabled).to.not.eq(null);

      log.level = 'error';
      expect(log.info.enabled).to.eq(null);
      expect(log.warn.enabled).to.eq(null);
      expect(log.error.enabled).to.not.eq(null);

      log.level = 'silent';
      expect(log.error.enabled).to.eq(null);
      log('hello world');
      expect(lines).to.have.length(0);

      log.level = 'trace';
      log('hello world');
      log.trace('hello world');
      log.debug('hello world');
      log.info('hello world');
      log.warn('hello world');
      log.error('hello world');

      expect(lines).to.have.length(7);
      expect(lines[0]).to.eq(TS_DAY);

      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} hello world${EOL}`);
      expect(lines[2]).to.eq(`${TS_TIME} ${L_T} hello world${EOL}`);
      expect(lines[3]).to.eq(`${TS_TIME} ${L_D} hello world${EOL}`);
      expect(lines[4]).to.eq(`${TS_TIME} ${L_I} hello world${EOL}`);
      expect(lines[5]).to.eq(`${TS_TIME} ${L_W} hello world${EOL}`);
      expect(lines[6]).to.eq(`${TS_TIME} ${L_E} hello world${EOL}`);
    });

    it('objects', () => {
      const {log} = require('tiny-node-logger');
      log('hello', 'world', 1, {num: 1, str: 'hey'}, new Date());
      const number = `1`;
      const object = `{ num: ${esc(33)}1${esc(39)}, str: ${esc(32)}\'hey\'${esc(39)} }`;
      const date = `${esc(35)}1970-01-01T00:00:00.000Z${esc(39)}`;
      expect(lines).to.have.length(2);
      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} hello world ${number} ${object} ${date}${EOL}`);
    });

    it('tagged template', () => {
      const {log} = require('tiny-node-logger');
      log.warn`hello ${'world'} ${1250} ${{num: 2, str: 'you'}} ${new Date(135027000000)}`;
      const number = `1250`;
      const object = `{ num: ${esc(33)}2${esc(39)}, str: ${esc(32)}\'you\'${esc(39)} }`;
      const date = `${esc(35)}1974-04-12T19:30:00.000Z${esc(39)}`;
      expect(lines).to.have.length(2);
      expect(lines[1]).to.eq(`${TS_TIME} ${L_W} hello world ${number} ${object} ${date}${EOL}`);
    });
  });

  describe('TTY at 80 cols', () => {

    beforeEach(() => {
      process.stdout.columns = 80;
      rerequire('tiny-node-logger').writer = lines.push.bind(lines);
    });

    it('hello world', () => {
      const {log} = require('tiny-node-logger');
      log('hello world');
      expect(lines).to.have.length(2);
      expect(lines[0]).to.eq(TS_DAY);
      // 'tiny-node-logger/test/logging.spec' = 34 chars, pad = 36
      const padding = `\x1B[999G\x1B[36D`;
      const suffix = padding + `${INK.BRIGHT_BLACK}tiny-node-logger/test/logging.spec${CLEAR}`;
      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} hello world${suffix}\n`);
    });

    it('source only printed on change', () => {
      const {log, logger} = require('tiny-node-logger');
      const log2 = logger('tiny-node-logger/test/examples');

      log('first message');
      log('second message');
      log2('third message');
      log2('fourth message');

      expect(lines).to.have.length(5);
      expect(lines[0]).to.eq(TS_DAY);

      // 'tiny-node-logger/test/logging.spec' = 34 chars, pad = 36
      const suffix = `\x1B[999G\x1B[36D${INK.BRIGHT_BLACK}tiny-node-logger/test/logging.spec${EOL}`;
      // 'tiny-node-logger/test/examples' = 30 chars, pad = 32
      const alt = `\x1B[999G\x1B[32D${INK.BRIGHT_BLACK}tiny-node-logger/test/examples${EOL}`;
      const same = `\x1B[999G\x1B[3D${INK.BRIGHT_BLACK}-${EOL}`;

      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} first message${suffix}`);
      expect(lines[2]).to.eq(`${TS_TIME} ${L_I} second message${same}`);
      expect(lines[3]).to.eq(`${TS_TIME} ${L_I} third message${alt}`);
      expect(lines[4]).to.eq(`${TS_TIME} ${L_I} fourth message${same}`);
    });

    it('should create logger with custom origin', () => {
      const {logger} = require('tiny-node-logger');
      const customLog = logger('custom/origin');

      customLog('test message');

      expect(lines).to.have.length(2);
      // 'custom/origin' = 13 chars, pad = 15
      const suffix = `\x1B[999G\x1B[15D${INK.BRIGHT_BLACK}custom/origin${EOL}`;
      expect(lines[1]).to.eq(`${TS_TIME} ${L_I} test message${suffix}`);
    });
  });

  describe('Case insensitive level setting', () => {
    beforeEach(() => {
      process.stdout.columns = 0;
      rerequire('tiny-node-logger').writer = lines.push.bind(lines);
    });

    it('should support uppercase level names', () => {
      const {logger} = require('tiny-node-logger');
      const log = logger();

      log.level = 'TRACE';
      expect(log.level).to.eq('trace');

      log.level = 'DEBUG';
      expect(log.level).to.eq('debug');

      log.level = 'INFO';
      expect(log.level).to.eq('info');

      log.level = 'WARN';
      expect(log.level).to.eq('warn');

      log.level = 'ERROR';
      expect(log.level).to.eq('error');

      log.level = 'SILENT';
      expect(log.level).to.eq('silent');
    });

    it('should support mixed case level names', () => {
      const {logger} = require('tiny-node-logger');
      const log = logger();

      log.level = 'TrAcE';
      expect(log.level).to.eq('trace');

      log.level = 'WaRn';
      expect(log.level).to.eq('warn');
    });
  });

  describe('File Appender', () => {
    const path = require('path');

    before(() => {
      restoreRealTimers();
    });

    it('should write only messages at or above threshold', async () => {
      const testFile = path.join(__dirname, 'test-threshold.log');
      const logging = rerequire('tiny-node-logger');
      logging.appender = {file: testFile, threshold: 'WARN'};

      const log = logging.logger('test');
      log.level = 'trace';
      log.trace('trace message');
      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      await schedule(async () => {
        const content = await fs.readFile(testFile, 'utf8');
        expect(content).to.not.include('trace message');
        expect(content).to.not.include('debug message');
        expect(content).to.not.include('info message');
        expect(content).to.include('warn message');
        expect(content).to.include('error message');
      }, 100);

      await fs.unlink(testFile);
    });

    it('should support TRACE and DEBUG thresholds', async () => {
      const testFile = path.join(__dirname, 'test-trace.log');
      const logging = rerequire('tiny-node-logger');
      logging.appender = {file: testFile, threshold: 'TRACE'};
      const log = logging.logger('test');
      log.level = 'trace';
      log.trace('trace message');
      log.debug('debug message');
      await schedule(async () => {
        const content = await fs.readFile(testFile, 'utf8');
        expect(content).to.include('trace message');
        expect(content).to.include('debug message');
      }, 100);
      await fs.unlink(testFile);
    });

    it('should write tagged template to file appender', async () => {
      const testFile = path.join(__dirname, 'test-template.log');
      const logging = rerequire('tiny-node-logger');
      logging.appender = {file: testFile};
      const log = logging.logger('test');
      log.warn`hello ${'world'} ${42}`;
      await schedule(async () => {
        const content = await fs.readFile(testFile, 'utf8');
        expect(content).to.include('hello');
        expect(content).to.include('world');
        expect(content).to.include('42');
      }, 100);
      await fs.unlink(testFile);
    });

    it('should write multiple string args to file appender', async () => {
      const testFile = path.join(__dirname, 'test-multiarg.log');
      const logging = rerequire('tiny-node-logger');
      logging.appender = {file: testFile};
      const log = logging.logger('test');
      log.warn('hello', 'world');
      await schedule(async () => {
        const content = await fs.readFile(testFile, 'utf8');
        expect(content).to.include('hello');
        expect(content).to.include('world');
      }, 100);
      await fs.unlink(testFile);
    });

    it('should support multiple file appenders with independent thresholds', async () => {
      const allFile = path.join(__dirname, 'test-all.log');
      const errFile = path.join(__dirname, 'test-errors.log');
      const logging = rerequire('tiny-node-logger');

      logging.appender = [
        {file: allFile, threshold: 'INFO'},
        {file: errFile, threshold: 'ERROR'},
      ];

      const log = logging.logger('test');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      await schedule(async () => {
        const [allContent, errContent] = await Promise.all([
          fs.readFile(allFile, 'utf8'),
          fs.readFile(errFile, 'utf8'),
        ]);
        expect(allContent).to.include('info message');
        expect(allContent).to.include('warn message');
        expect(allContent).to.include('error message');
        expect(errContent).to.not.include('info message');
        expect(errContent).to.not.include('warn message');
        expect(errContent).to.include('error message');
      }, 100);

      await fs.unlink(allFile);
      await fs.unlink(errFile);
    });
  });
});
