var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var htmlHintLoader = require('./index');

describe('htmlhint loader', function() {

  var prototype;
  beforeEach(function() {
    prototype = {
      emitError: sinon.spy(),
      cacheable: sinon.spy(),
      options: {}
    };
  });

  it('should export a function', function() {
    chai.assert.isFunction(htmlHintLoader);
  });

  it('should be cacheable', function() {
    htmlHintLoader.call(prototype, '');
    chai.expect(prototype.cacheable).to.have.been.calledOnce;
  });

});