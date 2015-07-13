var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var htmlHintLoader = require('./index');
var assert = chai.assert;
var expect = chai.expect;

describe('htmlhint loader', function() {

  var prototype, callback;
  beforeEach(function() {
    callback = sinon.spy();
    prototype = {
      emitError: sinon.spy(),
      cacheable: sinon.spy(),
      async: sinon.stub().returns(callback),
      options: {}
    };
  });

  it('should export a function', function() {
    assert.isFunction(htmlHintLoader);
  });

  it('should be cacheable', function() {
    htmlHintLoader.call(prototype, '');
    expect(prototype.cacheable).to.have.been.calledOnce;
  });

  it('should be async', function() {
    htmlHintLoader.call(prototype, '');
    expect(prototype.async).to.have.been.calledOnce;
  });

  it('should verify the given input html string', function() {
    //TODO
  });

  describe('output', function() {

    it('should not emit anything by default when there are no errors or warnings', function() {
      //TODO
    });

    it('should emit an error by default if there are 1 or more errors', function() {
      //TODO
    });

    it('should emit a warning by default if there are 1 or more warnings', function() {
      //TODO
    });

  });

  describe('htmlhint rules', function() {

    it('should use the default set of htmlhint rules if no options files is passed', function() {
      //TODO
    });

    it('should use the default set of htmlhint rules if the options file passed does not exist', function() {
      //TODO
    });

    it('should return an error if there was an error reading the config file', function() {
      //TODO
    });

    it('should return an error if there was an error parsing the config file', function() {
      //TODO
    });

  });

  describe('options', function() {

    describe('formatter', function() {

      it('should allow a default formatter to be passed', function() {
        //TODO
      });

    });

    describe('emitAs', function() {

      it('should always emit any output as an error if emitAs: error is true', function() {
        //TODO
      });

      it('should always emit any output as a warning if emitAs: warning is true', function() {
        //TODO
      });

    });

    describe('failOnError', function() {

      it('should return an error to the callback if true', function() {
        //TODO
      });

    });

    describe('failOnWarning', function() {

      it('should return an error to the callback if true', function() {
        //TODO
      });

    });

    describe('customRules', function() {

      it('should support adding custom htmlhint rules', function() {
        //TODO
      });

    });

    describe('htmlhint options', function() {

      it('should allow htmlhint options to be passed from the webpack config', function() {
        //TODO
      });

    });

  });


});