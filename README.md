# htmlhint-loader

> A webpack loader for htmlhint

[![npm version](https://badge.fury.io/js/htmlhint-loader.svg)](http://badge.fury.io/js/htmlhint-loader)
[![Build Status](https://travis-ci.org/mattlewis92/htmlhint-loader.svg)](https://travis-ci.org/mattlewis92/htmlhint-loader)
[![codecov](https://codecov.io/gh/mattlewis92/htmlhint-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/htmlhint-loader)
[![Dependency Status](https://david-dm.org/mattlewis92/htmlhint-loader.svg)](https://david-dm.org/mattlewis92/htmlhint-loader)
[![devDependency Status](https://david-dm.org/mattlewis92/htmlhint-loader/dev-status.svg)](https://david-dm.org/mattlewis92/htmlhint-loader#info=devDependencies)

## Install

```
npm install htmlhint-loader
```

## Usage

```javascript
module.exports = {
  module: {
    preLoaders: [
      {
        test: /\.html/,
        loader: 'htmlhint',
        exclude: /node_modules/
      }
    ]
  }
}
```

### Options

You can directly pass some [htmlhint rules](https://github.com/yaniswang/HTMLHint/wiki/Rules) by

- Adding a query string to the loader for this loader usage only

```javascript
{
  module: {
    preLoaders: [
      {
        test: /\.html/,
        loader: 'htmlhint?{tagname-lowercase: true}',
        exclude: /node_modules/
      },
    ]
  }
}
```

- Adding a `htmlhint` entry in your webpack config for global options:

```javascript
module.exports = {
  htmlhint: {
    configFile: 'path/.htmlhintrc'
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
  htmlhint: {
    customRules: [{
      id: 'my-rule-name',
      description: 'Example description',
      init: function(parser, reporter) {
        //see htmlhint docs / source for what to put here
      }
    }]
  }
}
```

##### `outputReport` (default: `false`)
Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI

The `filePath` is relative to the webpack config: output.path
The use of [name] is supported when linting multiple files.
You can pass in a different formatter for the output file, if none is passed in the default/configured formatter will be used

```js
module.exports = {
  entry: "...",
  module: {
    // ...
  },
  htmlhint: {
    outputReport: {
      filePath: 'checkstyle-[name].xml',
      formatter: require('htmlhint/bin/formatters/checkstyle')
    }
  }
}
```

## Credits

I based a lot of this code off the [eslint-loader](https://github.com/MoOx/eslint-loader) and the [gulp htmlhint plugin](https://github.com/bezoerb/gulp-htmlhint), so a big thanks is due to the authors of those modules.

## Licence

MIT
