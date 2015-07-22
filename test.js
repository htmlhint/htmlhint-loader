'use strict';

/*eslint-env mocha */

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

chai.use(sinonChai);
var assert = chai.assert;
var expect = chai.expect;

describe('htmlhint loader', function() {

  var prototype, callback, inputString, errorResult, warningResult, htmlHintLoader, htmlhintStub, fsStub;
  beforeEach(function() {

    htmlhintStub = {
      verify: sinon.stub().returns([]),
      addRule: sinon.stub(),
      defaultRuleset: {
        defaultRule: {
          id: 'default'
        }
      }
    };

    fsStub = {
      exists: sinon.stub().callsArgWith(1, false),
      readFile: sinon.stub().callsArgWith(1, null, '')
    };

    htmlHintLoader = rewire('./index');

    htmlHintLoader.__set__({ //eslint-disable-line no-underscore-dangle
      fs: fsStub,
      HTMLHint: htmlhintStub
    });

    callback = sinon.spy();
    prototype = {
      emitError: sinon.spy(),
      emitWarning: sinon.spy(),
      cacheable: sinon.spy(),
      async: sinon.stub().returns(callback),
      options: {}
    };
    inputString = '<html></html>';
    errorResult = [{
      type: 'error',
      evidence: '',
      rule: {},
      line: 10,
      col: 0
    }, {
      type: 'error',
      evidence: '',
      rule: {},
      line: 10,
      col: 10
    }];
    warningResult = [{
      type: 'warning',
      evidence: '',
      rule: {}
    }];
    htmlhintStub.verify.returns([]);
  });

  it('should export a function', function() {
    assert.isFunction(htmlHintLoader);
  });

  it('should be cacheable', function() {
    htmlHintLoader.call(prototype, inputString);
    expect(prototype.cacheable).to.have.been.calledOnce;
  });

  it('should be async', function() {
    htmlHintLoader.call(prototype, inputString);
    expect(prototype.async).to.have.been.calledOnce;
  });

  it('should verify the given input html string', function() {

    htmlHintLoader.call(prototype, inputString);
    expect(callback).to.have.been.calledWith(null, inputString);
    expect(htmlhintStub.verify).to.have.been.calledWith(inputString);
  });

  describe('output', function() {

    it('should not emit anything by default when there are no errors or warnings', function() {
      htmlHintLoader.call(prototype, inputString);
      expect(callback).to.have.been.calledWith(null, inputString);
      expect(prototype.emitError).not.to.have.been.called;
    });

    it('should emit an error by default if there are 1 or more errors', function() {
      htmlhintStub.verify.returns(errorResult);
      htmlHintLoader.call(prototype, inputString);
      expect(callback).to.have.been.calledWith(null, inputString);
      expect(prototype.emitError).to.have.been.called;
      expect(prototype.emitWarning).not.to.have.been.called;
    });

    it('should emit a warning by default if there are 1 or more warnings', function() {
      htmlhintStub.verify.returns(warningResult);
      htmlHintLoader.call(prototype, inputString);
      expect(callback).to.have.been.calledWith(null, inputString);
      expect(prototype.emitError).not.to.have.been.called;
      expect(prototype.emitWarning).to.have.been.called;
    });

  });

  describe('htmlhint rules', function() {

    var verifyArgs;

    beforeEach(function() {
      htmlhintStub.verify = function(input, options) {
        verifyArgs = {
          input: input,
          options: options
        };
        return [];
      };
    });

    it('should return an error if there was an error reading the config file', function() {
      var error = new Error();

      fsStub.exists.callsArgWith(1, true);

      fsStub.readFile.callsArgWith(1, error);

      htmlHintLoader.call(prototype, inputString);
      expect(callback).to.have.been.calledWith(error);

    });

    it('should return an error if there was an error parsing the config file', function() {

      fsStub.exists.callsArgWith(1, true);

      fsStub.readFile.callsArgWith(1, null, '{INVALID{');

      htmlHintLoader.call(prototype, inputString);
      expect(callback).not.to.have.been.calledWith(null);
    });

    it('should pass in any options from the htmlhint file', function() {

      fsStub.exists.callsArgWith(1, true);
      fsStub.readFile.callsArgWith(1, null, '{"aRule": true}');

      htmlHintLoader.call(prototype, inputString);
      expect(callback).to.have.been.calledWith(null);
      expect(verifyArgs.options.aRule).to.be.true;
    });

  });

  describe('options', function() {

    describe('formatter', function() {

      it('should allow a default formatter to be passed', function() {
        htmlhintStub.verify.returns(errorResult);
        var formatter = sinon.stub().returns('input');
        prototype.options = {
          htmlhint: {
            formatter: formatter
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(formatter).to.have.been.calledWith(errorResult);
      });

    });

    describe('emitAs', function() {

      it('should always emit any output as an error if emitAs: error is true', function() {
        htmlhintStub.verify.returns(warningResult);
        prototype.options = {
          htmlhint: {
            emitAs: 'error'
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(prototype.emitError).to.have.been.called;
        expect(prototype.emitWarning).not.to.have.been.called;
      });

      it('should always emit any output as a warning if emitAs: warning is true', function() {
        htmlhintStub.verify.returns(errorResult);
        prototype.options = {
          htmlhint: {
            emitAs: 'warning'
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(prototype.emitError).not.to.have.been.called;
        expect(prototype.emitWarning).to.have.been.called;
      });

    });

    describe('failOnError', function() {

      it('should return an error to the callback if true', function() {
        htmlhintStub.verify.returns(errorResult);
        prototype.options = {
          htmlhint: {
            failOnError: true
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(callback).not.to.have.been.calledWith(null);
      });

    });

    describe('failOnWarning', function() {

      it('should return an error to the callback if true', function() {
        htmlhintStub.verify.returns(warningResult);
        prototype.options = {
          htmlhint: {
            failOnWarning: true
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(callback).not.to.have.been.calledWith(null);
      });

    });

    describe('customRules', function() {

      it('should support adding custom htmlhint rules', function() {
        var customRule = {
          id: 'some id',
          rule: 'a custom rule'
        };
        prototype.options = {
          htmlhint: {
            customRules: [customRule]
          }
        };
        htmlHintLoader.call(prototype, inputString);
        expect(callback).to.have.been.calledWith(null, inputString);
        expect(htmlhintStub.addRule).to.have.been.calledWith(customRule);
      });

    });

  });

});
