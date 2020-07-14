<h1 align="center">
  <br>
  HTMLHint Loader
  <br>
</h1>

<h4 align="center">A Webpack loader for HTMLHint</h4>

<p align="center">
  <a href="https://travis-ci.org/htmlhint/htmlhint-loader">
    <img src="https://img.shields.io/travis/htmlhint/htmlhint-loader.svg" alt="Travis Build Status">
  </a>
  <a href="https://codecov.io/gh/htmlhint/htmlhint-loader">
    <img src="https://codecov.io/gh/htmlhint/htmlhint-loader/branch/master/graph/badge.svg" alt="Codecov">
  </a>
  <a href="https://www.npmjs.com/package/htmlhint-loader">
    <img src="https://img.shields.io/npm/dm/htmlhint-loader.svg" alt="NPM count">
  </a>
  <img src="https://badgen.net/badge/license/MIT/green" alt="MIT Licence" />
  <a href="https://discord.gg/nJ6J9CP">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" alt="Chat">
  </a>
  <a href="http://roadmap.htmlhint.io/roadmap">
    <img src="https://img.shields.io/badge/check-our%20roadmap-EE503E.svg" alt="Chat">
  </a>
</p>

<p align="center">
  <a href="#install">How To Use</a> • <a href="/CONTRIBUTING.md">Contributing</a> • <a href="http://roadmap.htmlhint.io/">Roadmap</a> • <a href="https://htmlhint.com">Website</a>
</p>

## Table of Contents

- **[Install](#install)**
- **[Usage](#usage)**
- **[Options](#options)**

## Install

```
npm install htmlhint-loader
```

## Usage

```javascript
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
```

### Options

You can directly pass some [htmlhint rules](https://github.com/htmlhint/HTMLHint/wiki/Rules) by

- Adding a query string to the loader for this loader usage only

```javascript
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader?{tagname-lowercase: true}',
        exclude: /node_modules/,
      },
    ],
  },
}
```

- Adding a `htmlhint` entry in your webpack loader options:

```javascript
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'path/.htmlhintrc',
        },
      },
    ],
  },
}
```

#### `configFile`

A path to a json file containing the set of htmlhint rules you would like applied to this project. _By default all rules are turned off and it is up to you to enable them._

Example file:

```javascript
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true
}
```

#### `formatter` (default: a function that pretty prints any warnings and errors)

The function is called with an array of messages direct for htmlhint and must return a string.

#### `emitAs` (default: `null`)

What to emit errors and warnings as. Set to `warning` to always emit errors as warnings and `error` to always emit warnings as errors. By default the plugin will auto detect whether to emit as a warning or an error.

#### `failOnError` (default `false`)

Whether to force webpack to fail the build on a htmlhint error

#### `failOnWarning` (default `false`)

Whether to force webpack to fail the build on a htmlhint warning

#### `customRules`

Any custom rules you would like added to htmlhint. Specify as an array like so:

```javascript
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader',
        exclude: /node_modules/,
        options: {
          customRules: [
            {
              id: 'my-rule-name',
              description: 'Example description',
              init: function (parser, reporter) {
                //see htmlhint docs / source for what to put here
              },
            },
          ],
        },
      },
    ],
  },
}
```

#### `rulesDir`

You can add a path to a folder containing your custom rules.
See below for the format of the rule, it is not the same as HTMLHINT - you can pass a value to a rule.

```javascript
// webpack config
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader',
        exclude: /node_modules/,
        options: {
          rulesDir: path.join(__dirname, 'rules/'),
          'my-new-rule': 'this is pass to the rule (option)',
        },
      },
    ],
  },
}
```

```javascript
// rules/myNewRule.js
const id = 'my-new-rule'

module.exports = {
  id,
  rule: function (
    HTMLHint,
    option /* = 'this is pass to the rule (option)' */
  ) {
    HTMLHint.addRule({
      id,
      description: 'my-new-rule',
      init: () => {
        //see htmlhint docs / source for what to put here
      },
    })
  },
}
```

##### `outputReport` (default: `false`)

Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI

The `filePath` is relative to the webpack config: output.path
The use of [name] is supported when linting multiple files.
You can pass in a different formatter for the output file, if none is passed in the default/configured formatter will be used

```javascript
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.html/,
        loader: 'htmlhint-loader',
        exclude: /node_modules/,
        options: {
          outputReport: {
            filePath: 'checkstyle-[name].xml',
            formatter(messages) {
              // convert messages to a string that will be written to the file
              return messagesFormattedToString
            },
          },
        },
      },
    ],
  },
}
```

## Licence

Project initially created by [@mattlewis](https://github.com/mattlewis92) and transferred to the [HTMLHint](https://github.com/htmlhint) organization.

<a href="https://htmlhint.com"><img src="https://raw.githubusercontent.com/htmlhint/htmlhint/develop/src/img/htmlhint.png" alt="Logo HTMLHint" width="65"></a>

[MIT License](./LICENSE)
