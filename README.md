# htmlhint-loader

[![npm version](https://badge.fury.io/js/htmlhint-loader.svg)](http://badge.fury.io/js/htmlhint-loader)
[![Build Status](https://travis-ci.org/mattlewis92/htmlhint-loader.svg)](https://travis-ci.org/thedaviddias/htmlhint-loader)
[![codecov](https://codecov.io/gh/thedaviddias/htmlhint-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/thedaviddias/htmlhint-loader)
[![Dependency Status](https://david-dm.org/mattlewis92/htmlhint-loader.svg)](https://david-dm.org/mattlewis92/htmlhint-loader)
[![devDependency Status](https://david-dm.org/thedaviddias/htmlhint-loader/dev-status.svg)](https://david-dm.org/thedaviddias/htmlhint-loader?type=dev)

> A webpack loader for htmlhint

## Install

```
npm install htmlhint-loader
```

## Usage

```javascript
module.exports = {
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader',
      exclude: /node_modules/
    }]
  }
}
```

### Options

You can directly pass some [htmlhint rules](https://github.com/thedaviddias/HTMLHint/wiki/Rules) by

- Adding a query string to the loader for this loader usage only

```javascript
module.exports = {
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader?{tagname-lowercase: true}',
      exclude: /node_modules/
    }]
  }
}
```

- Adding a `htmlhint` entry in your webpack loader options:

```javascript
module.exports = {
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader',
      exclude: /node_modules/,
      options: {
        configFile: 'path/.htmlhintrc'
      }
    }]
  }
}
```

#### `configFile`

A path to a json file containing the set of htmlhint rules you would like applied to this project. *By default all rules are turned off and it is up to you to enable them.*

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
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader',
      exclude: /node_modules/,
      options: {
        customRules: [{
          id: 'my-rule-name',
          description: 'Example description',
          init: function(parser, reporter) {
            //see htmlhint docs / source for what to put here
          }
        }]
      }
    }]
  }
}
```

#### `rulesDir`

You can add a path to a folder containing your custom rules.
See below for the format of the rule, it is not the same as HTMLHINT - you can pass a value to a rule.
```javascript
// webpack config
module.exports = {
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader',
      exclude: /node_modules/,
      options: {
        rulesDir: path.join(__dirname, 'rules/'),
        'my-new-rule': 'this is pass to the rule (option)'
      }
    }]
  }
}
```

```javascript
// rules/myNewRule.js
const id = 'my-new-rule';

module.exports = {
  id,
  rule: function(HTMLHint, option /* = 'this is pass to the rule (option)' */) {
    HTMLHint.addRule({
      id,
      description: 'my-new-rule',
      init: () => {
        //see htmlhint docs / source for what to put here
      }
    });
  }
};
```

##### `outputReport` (default: `false`)
Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI

The `filePath` is relative to the webpack config: output.path
The use of [name] is supported when linting multiple files.
You can pass in a different formatter for the output file, if none is passed in the default/configured formatter will be used

```javascript
module.exports = {
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.html/,
      loader: 'htmlhint-loader',
      exclude: /node_modules/,
      options: {
        outputReport: {
          filePath: 'checkstyle-[name].xml',
          formatter(messages) {
            // convert messages to a string that will be written to the file
            return messagesFormattedToString;
          }
        }
      }
    }]
  }
}
```

## Credits

I based a lot of this code off the [eslint-loader](https://github.com/MoOx/eslint-loader) and the [gulp htmlhint plugin](https://github.com/bezoerb/gulp-htmlhint), so a big thanks is due to the authors of those modules.

## Licence

MIT
