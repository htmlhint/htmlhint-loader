var HTMLHint = require('htmlhint').HTMLHint;
var loaderUtils = require('loader-utils');
var assign = require('object-assign');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

var HTMLHINT_CONFIG_FILE = '.htmlhintrc';
var htmlHintConfig = HTMLHint.defaultRuleset;
var configFile = path.join(process.cwd(), HTMLHINT_CONFIG_FILE);
if (fs.existsSync(configFile)) {
  try {
    htmlHintConfig = JSON.parse(fs.readFileSync(configFile));
  } catch (e) {
    throw new Error('Could not parse the .htmlhintrc file!');
  }
}

function formatMessage(message) {

  var evidence = message.evidence;
  var line = message.line;
  var col = message.col;
  var detail = typeof message.line !== 'undefined' ?
  chalk.yellow('L' + line) + chalk.red(':') + chalk.yellow('C' + col) : chalk.yellow('GENERAL');

  if (col === 0) {
    evidence = chalk.red('?') + evidence;
  } else if (col > evidence.length) {
    evidence = chalk.red(evidence + ' ');
  } else {
    evidence = evidence.slice(0, col - 1) + chalk.red(evidence[col - 1]) + evidence.slice(col);
  }

  return {
    message: chalk.red('[') + detail + chalk.red(']') + chalk.yellow(' ' + message.message) + ' (' + message.rule.id + ')',
    evidence: evidence
  };

}

function defaultFormatter(messages) {

  var output = '';

  messages.forEach(function(message) {
    var formatted = formatMessage(message);
    output += formatted.message + '\n';
    output += formatted.evidence + '\n';
  });

  return output.trim();
}

function lint(source, options, webpack) {

  if (options.rules) {
    options.rules.forEach(function(rule) {
      HTMLHint.addRule(rule);
    });
  }

  var report = HTMLHint.verify(source, htmlHintConfig);
  if (report.length > 0) {

    var reportByType = {
      warning: report.filter(function(message) {
        return message.type === 'warning'
      }),
      error: report.filter(function(message) {
        return message.type === 'error'
      })
    };

    var emitter;
    if (options.emitAs === 'error') {
      emitter = webpack.emitError;
    } else if (options.emitAs === 'warning') {
      emitter = webpack.emitWarning;
    }

    if (reportByType.warning.length > 0) {

      var warning = options.formatter(reportByType.warning);
      emitter ? emitter(warning) : webpack.emitWarning(warning);

    }

    if (reportByType.error.length > 0) {

      var error = options.formatter(reportByType.error);
      emitter ? emitter(error) : webpack.emitError(error);

      if (options.failOnError) {
        throw new Error('Module failed because of a htmlhint error.');
      }

    }
    
    if (reportByType.warning.length > 0 && options.failOnWarning) {
      throw new Error('Module failed because of a htmlhint warning.');
    }

  }
}

module.exports = function(source) {

  var options = assign(
    {  // loader defaults
      formatter: defaultFormatter,
      emitAs: null, //can be either warning or error
      failOnError: false,
      failOnWarning: false,
      rules: []
    },
    htmlHintConfig, //htmlhint default rules
    this.options.htmlhint || {}, // user defaults
    loaderUtils.parseQuery(this.query) // loader query string
  );

  this.cacheable();

  lint(source, options, this);

  return source;

};