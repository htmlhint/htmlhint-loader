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

function formatMessages(messages) {

  return messages.map(function(message) {
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
  });
}

function defaultFormatter(messages) {

  var errorCount = messages.length;
  var plural = errorCount === 1 ? '' : 's';

  var output = chalk.cyan(errorCount) + ' error' + plural + ' found ';

  formatMessages(messages).forEach(function(data) {
    output += data.message + '\n';
    output += data.evidence + '\n';
  });

  return output.trim();
}

function lint(source, config, webpack) {

  var report = HTMLHint.verify(source, htmlHintConfig);
  if (report.length > 0) {
    var messages = config.formatter(report);

    if (config.emitError) {
      webpack.emitError(messages);
    }

    if (config.failOnError) {
      throw new Error('Module failed because of a htmlhint error.');
    }

  }
}

module.exports = function(source) {

  var config = assign(
    {  // loader defaults
      formatter: defaultFormatter,
      emitError: false,
      failOnError: false
    },
    htmlHintConfig, //htmlhint default rules
    this.options.htmlhint || {}, // user defaults
    loaderUtils.parseQuery(this.query) // loader query string
  );

  this.cacheable();

  lint(source, config, this);

  return source;

};