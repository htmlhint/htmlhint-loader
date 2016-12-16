'use strict';

const HTMLHint = require('htmlhint').HTMLHint;
const loaderUtils = require('loader-utils');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

function formatMessage(message) {

  let evidence = message.evidence;
  const line = message.line;
  const col = message.col;
  const detail = typeof message.line !== 'undefined'
    ? `${chalk.yellow('L' + line)}${chalk.red(':')}${chalk.yellow('C' + col)}` : chalk.yellow('GENERAL');

  if (col === 0) {
    evidence = chalk.red('?') + evidence;
  } else if (col > evidence.length) {
    evidence = chalk.red(evidence + ' ');
  } else {
    evidence = `${evidence.slice(0, col - 1)}${chalk.red(evidence[col - 1])}${evidence.slice(col)}`;
  }

  return {
    message: `${chalk.red('[')}${detail}${chalk.red(']')}${chalk.yellow(' ' + message.message)} (${message.rule.id})`,
    evidence: evidence
  };

}

function defaultFormatter(messages) {

  let output = '';

  messages.forEach(message => {
    const formatted = formatMessage(message);
    output += formatted.message + '\n';
    output += formatted.evidence + '\n';
  });

  return output.trim();
}

function lint(source, options, webpack, done) {

  try {

    if (options.customRules) {
      options.customRules.forEach(rule => HTMLHint.addRule(rule));
    }

    const report = HTMLHint.verify(source, options);
    if (report.length > 0) {

      const reportByType = {
        warning: report.filter(message => message.type === 'warning'),
        error: report.filter(message => message.type === 'error')
      };

      // add filename for each results so formatter can have relevant filename
      report.forEach(r => {
        r.filePath = webpack.resourcePath;
      });

      const messages = options.formatter(report);
      if (options.outputReport && options.outputReport.filePath) {
        let reportOutput;
        // if a different formatter is passed in as an option use that
        if (options.outputReport.formatter) {
          reportOutput = options.outputReport.formatter(report);
        } else {
          reportOutput = messages;
        }
        const filePath = loaderUtils.interpolateName(webpack, options.outputReport.filePath, {
          content: report.map(r => r.filePath).join('\n'),
        });
        webpack.emitFile(filePath, reportOutput);

      }

      let emitter = reportByType.error.length > 0 ? webpack.emitError : webpack.emitWarning;
      if (options.emitAs === 'error') {
        emitter = webpack.emitError;
      } else if (options.emitAs === 'warning') {
        emitter = webpack.emitWarning;
      }

      emitter(options.formatter(report));

      if (reportByType.error.length > 0 && options.failOnError) {
        throw new Error('Module failed because of a htmlhint error.');
      }

      if (reportByType.warning.length > 0 && options.failOnWarning) {
        throw new Error('Module failed because of a htmlhint warning.');
      }

    }

    done(null, source);

  } catch (e) {
    done(e);
  }

}

module.exports = function(source) {

  const options = Object.assign(
    {  // loader defaults
      formatter: defaultFormatter,
      emitAs: null, //can be either warning or error
      failOnError: false,
      failOnWarning: false,
      customRules: [],
      configFile: '.htmlhintrc'
    },
    this.options.htmlhint || {}, // user defaults
    loaderUtils.parseQuery(this.query) // loader query string
  );

  this.cacheable();

  const done = this.async();

  const configFilePath = path.join(process.cwd(), options.configFile);

  fs.exists(configFilePath, exists => {

    if (exists) {

      fs.readFile(configFilePath, (err, configString) => {

        if (err) {
          done(err);
        } else {

          try {
            const htmlHintConfig = JSON.parse(configString);
            lint(source, Object.assign(options, htmlHintConfig), this, done);
          } catch (e) {
            done(new Error('Could not parse the htmlhint config file'));
          }

        }

      });

    } else {

      lint(source, options, this, done);

    }

  });

};
