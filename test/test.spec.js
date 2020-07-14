'use strict'

import fs from 'fs'
import path from 'path'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import webpack from 'webpack'
import stripAnsi from 'strip-ansi'

chai.use(sinonChai)
const { expect } = chai

const webpackBase = {
  mode: 'development',
  output: {
    path: path.join(__dirname, 'output'),
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: path.join(__dirname, '../index'),
        exclude: /node_modules/,
        enforce: 'pre',
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: /node_modules/,
      },
    ],
  },
}

const expectedErrorMessage =
  '[L1:C1] The html element name of [ BR ] must be in lowercase. (tagname-lowercase)\n<BR>'

describe('htmlhint loader', () => {
  it('should not emit an error if there are no rules enabled', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
      },
      (err, stats) => {
        if (err) {
          done(err)
        } else {
          expect(stats.hasErrors()).to.equal(false)
          done()
        }
      }
    )
  })

  it('should emit an error', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                'tagname-lowercase': true,
              },
            },
          }),
        ],
      },
      (err, stats) => {
        if (err) {
          done(err)
        } else {
          expect(stats.hasErrors()).to.equal(true)
          expect(stripAnsi(stats.compilation.errors[0].message)).to.have.string(
            expectedErrorMessage
          )
          done()
        }
      }
    )
  })

  it('should emit errors as warnings', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                'tagname-lowercase': true,
                emitAs: 'warning',
              },
            },
          }),
        ],
      },
      (err, stats) => {
        if (err) {
          done(err)
        } else {
          expect(stats.hasErrors()).to.equal(false)
          expect(stats.hasWarnings()).to.equal(true)
          expect(
            stripAnsi(stats.compilation.warnings[0].message)
          ).to.have.string(expectedErrorMessage)
          done()
        }
      }
    )
  })

  it('should produce results to two file', (done) => {
    const outputFilename = 'outputReport-[name].txt'
    const expectedOutFilenames = [
      'outputReport-template.txt',
      'outputReport-template-two.txt',
    ]

    webpack(
      {
        ...webpackBase,
        entry: [
          path.resolve(__dirname, 'fixtures/error/error.js'),
          path.resolve(__dirname, 'fixtures/error/error-two.js'),
        ],
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                'tagname-lowercase': true,
                outputReport: {
                  filePath: outputFilename,
                },
              },
            },
          }),
        ],
      },
      (err) => {
        if (err) {
          done(err)
        } else {
          const file1Content = fs.readFileSync(
            path.resolve(__dirname, 'output', expectedOutFilenames[0]),
            'utf8'
          )
          expect(stripAnsi(expectedErrorMessage)).to.equal(
            stripAnsi(file1Content)
          )
          const file2Content = fs.readFileSync(
            path.resolve(__dirname, 'output', expectedOutFilenames[1]),
            'utf8'
          )
          expect(stripAnsi(expectedErrorMessage)).to.equal(
            stripAnsi(file2Content)
          )
          done()
        }
      }
    )
  })

  it('should use the htmlhintrc file', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                configFile: 'test/.htmlhintrc',
              },
            },
          }),
        ],
      },
      (err, stats) => {
        if (err) {
          done(err)
        } else {
          expect(stats.hasErrors()).to.equal(true)
          expect(stripAnsi(stats.compilation.errors[0].message)).to.have.string(
            expectedErrorMessage
          )
          done()
        }
      }
    )
  })

  it('should handle the htmlhintrc file being invalid json', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                configFile: 'test/.htmlhintrc-broken',
              },
            },
          }),
        ],
      },
      (err, stats) => {
        expect(err).to.equal(null)
        expect(
          stats.compilation.errors[0].message.includes(
            'Could not parse the htmlhint config file'
          )
        ).to.equal(true)
        done()
      }
    )
  })

  it('should allow custom rules', (done) => {
    const ruleCalled = sinon.spy()

    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                customRules: [
                  {
                    id: 'my-rule-name',
                    description: 'Example description',
                    init: ruleCalled,
                  },
                ],
                'my-rule-name': true,
              },
            },
          }),
        ],
      },
      () => {
        expect(ruleCalled).to.have.been.callCount(1)
        done()
      }
    )
  })

  it('should allow rulesDir', (done) => {
    const ruleCalled = sinon.spy()

    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                rulesDir: path.join(__dirname, 'fixtures/rules'),
                'my-new-rule': ruleCalled,
              },
            },
          }),
        ],
      },
      () => {
        expect(ruleCalled).to.have.been.callCount(1)
        done()
      }
    )
  })

  it('should handle utf-8 BOM encoded configs', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                configFile: 'test/htmlhint.json',
              },
            },
          }),
        ],
      },
      (err, stats) => {
        if (err) {
          done(err)
        } else {
          expect(stats.hasErrors()).to.equal(false)
          done()
        }
      }
    )
  })

  it('should allow absolute config file paths', (done) => {
    webpack(
      {
        ...webpackBase,
        entry: path.join(__dirname, 'fixtures/error/error.js'),
        plugins: [
          new webpack.LoaderOptionsPlugin({
            options: {
              htmlhint: {
                configFile: path.join(__dirname, '.htmlhintrc'),
              },
            },
          }),
        ],
      },
      (err, stats) => {
        if (err) {
          done(stats)
        } else {
          expect(stats.hasErrors()).to.equal(true)
          expect(stripAnsi(stats.compilation.errors[0].message)).to.have.string(
            expectedErrorMessage
          )
          done()
        }
      }
    )
  })
})
