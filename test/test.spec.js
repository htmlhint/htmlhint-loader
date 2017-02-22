'use strict';

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const webpack = require('webpack');
const stripAnsi = require('strip-ansi');

chai.use(sinonChai);
const expect = chai.expect;

const webpackBase = {
  output: {
    path: path.join(__dirname, 'output')
  },
  module: {
    rules: [{
      test: /\.html$/,
      loader: path.join(__dirname, '../index'),
      exclude: /node_modules/,
      enforce: 'pre'
    }, {
      test: /\.html$/,
      loader: 'raw-loader',
      exclude: /node_modules/
    }]
  }
};

const expectedErrorMessage = '[L1:C1] The html element name of [ BR ] must be in lowercase. (tagname-lowercase)\n<BR>';

describe('htmlhint loader', () => {
  it('should not emit an error if there are no rules enabled', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js')
    }), (err, stats) => {
      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.equal(false);
        done();
      }
    });
  });

  it('should emit an error', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              'tagname-lowercase': true
            }
          }
        })
      ]
    }), (err, stats) => {
      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.equal(true);
        expect(stripAnsi(stats.compilation.errors[0].message)).to.equal(expectedErrorMessage);
        done();
      }
    });
  });

  it('should emit errors as warnings', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              'tagname-lowercase': true,
              emitAs: 'warning'
            }
          }
        })
      ]
    }), (err, stats) => {
      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.equal(false);
        expect(stats.hasWarnings()).to.equal(true);
        expect(stripAnsi(stats.compilation.warnings[0].message)).to.equal(expectedErrorMessage);
        done();
      }
    });
  });

  it('should produce results to two file', done => {
    const outputFilename = 'outputReport-[name].txt';
    const expectedOutFilenames = ['outputReport-template.txt', 'outputReport-template-two.txt'];

    webpack(Object.assign({}, webpackBase, {
      entry: [
        `${__dirname}/fixtures/error/error.js`,
        `${__dirname}/fixtures/error/error-two.js`
      ],
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              'tagname-lowercase': true,
              outputReport: {
                filePath: outputFilename
              }
            }
          }
        })
      ]
    }), err => {
      if (err) {
        done(err);
      } else {
        const file1Content = fs.readFileSync(`${__dirname}/output/${expectedOutFilenames[0]}`, 'utf8');
        expect(stripAnsi(expectedErrorMessage)).to.equal(stripAnsi(file1Content));
        const file2Content = fs.readFileSync(`${__dirname}/output/${expectedOutFilenames[1]}`, 'utf8');
        expect(stripAnsi(expectedErrorMessage)).to.equal(stripAnsi(file2Content));
        done();
      }
    });
  });

  it('should use the htmlhintrc file', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              configFile: 'test/.htmlhintrc'
            }
          }
        })
      ]
    }), (err, stats) => {
      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.equal(true);
        expect(stripAnsi(stats.compilation.errors[0].message)).to.equal(expectedErrorMessage);
        done();
      }
    });
  });

  it('should handle the htmlhintrc file being invalid json', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              configFile: 'test/.htmlhintrc-broken'
            }
          }
        })
      ]
    }), (err, stats) => {
      expect(err).to.equal(null);
      expect(stats.compilation.errors[0].message.indexOf('Could not parse the htmlhint config file') > -1).to.equal(true);
      done();
    });
  });

  it('should allow custom rules', done => {
    const ruleCalled = sinon.spy();

    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              customRules: [{
                id: 'my-rule-name',
                description: 'Example description',
                init: ruleCalled
              }],
              'my-rule-name': true
            }
          }
        })
      ]
    }), () => {
      expect(ruleCalled).to.have.been.callCount(1);
      done();
    });
  });

  it('should handle utf-8 BOM encoded configs', done => {
    webpack(Object.assign({}, webpackBase, {
      entry: path.join(__dirname, 'fixtures/error/error.js'),
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            htmlhint: {
              configFile: 'test/htmlhint.json'
            }
          }
        })
      ]
    }), (err, stats) => {
      if (err) {
        done(err);
      } else {
        expect(stats.hasErrors()).to.equal(false);
        done();
      }
    });
  });
});
