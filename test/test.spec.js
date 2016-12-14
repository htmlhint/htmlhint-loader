'use strict';

/*eslint-env mocha */

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const webpack = require('webpack');
const stripAnsi = require('strip-ansi');

chai.use(sinonChai);
const expect = chai.expect;

const webpackBase = {
  output: {
    path: __dirname + '/output',
  },
  module: {
    preLoaders: [{
      test: /\.html$/,
      loader: __dirname + '/../index',
      exclude: /node_modules/
    }],
    loaders: [{
      test: /\.html$/,
      loader: 'raw',
      exclude: /node_modules/
    }]
  }
};

const expectedErrorMessage = '[L1:C1] The html element name of [ BR ] must be in lowercase. (tagname-lowercase)\n<BR>';

describe('htmlhint loader', () => {

  it('should not emit an error if there are no rules enabled', done => {

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js'
    }), (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.be.false;
        done();
      }

    });

  });



  it('should emit an error', done => {

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js',
      htmlhint: {
        'tagname-lowercase': true
      }
    }), (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.be.true;
        expect(stripAnsi(stats.compilation.errors[0].message)).to.equal(expectedErrorMessage);
        done();
      }

    });

  });

  it('should emit errors as warnings', done => {

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js',
      htmlhint: {
        'tagname-lowercase': true,
        emitAs: 'warning'
      }
    }), (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.be.false;
        expect(stats.hasWarnings()).to.be.true;
        expect(stripAnsi(stats.compilation.warnings[0].message)).to.equal(expectedErrorMessage);
        done();
      }

    });

  });

  it("should produce results to a file", done => {

    var outputFilename = "outputReport.txt"

    webpack(Object.assign({}, webpackBase, {
      entry: "./test/fixtures/error.js",
      htmlhint: {
        formatter: require("htmlint/bin/formatters/checkstyle"),
        outputReport: {
          filePath: outputFilename,
        }
      }
    }), (err, stats) => {
        if(err) {
          done(err);
        } else {
          expect(fs.existsSync(outputFilename)).to.be.true
          done();
        }
    });
  });


  it('should use the htmlhintrc file', done => {

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js',
      htmlhint: {
        configFile: 'test/.htmlhintrc'
      }
    }), (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.be.true;
        expect(stripAnsi(stats.compilation.errors[0].message)).to.equal(expectedErrorMessage);
        done();
      }

    });

  });

  it('should handle the htmlhintrc file being invalid json', done => {

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js',
      htmlhint: {
        configFile: 'test/.htmlhintrc-broken'
      }
    }), (err, stats) => {

      expect(stats.compilation.errors[0].message.indexOf('Could not parse the htmlhint config file') > -1).to.be.true;
      done();

    });

  });

  it('should allow custom rules', done => {

    const ruleCalled = sinon.spy();

    webpack(Object.assign({}, webpackBase, {
      entry: __dirname + '/fixtures/error/error.js',
      htmlhint: {
        customRules: [{
          id: 'my-rule-name',
          description: 'Example description',
          init: ruleCalled
        }],
        'my-rule-name': true
      }
    }), () => {

      expect(ruleCalled).to.have.been.called;
      done();

    });

  });

});
