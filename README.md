# pino-abstract-transport
[![npm version](https://img.shields.io/npm/v/pino-abstract-transport)](https://www.npmjs.com/package/pino-abstract-transport)
[![Build Status](https://img.shields.io/github/workflow/status/pinojs/pino-abstract-transport/CI)](https://github.com/pinojs/pino-abstract-transport/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/pinojs/pino-abstract-transport/badge.svg)](https://snyk.io/test/github/pinojs/pino-abstract-transport)
[![Coverage Status](https://coveralls.io/repos/github/pinojs/pino-abstract-transport/badge.svg?branch=master)](https://coveralls.io/github/pinojs/pino-abstract-transport?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

Write Pino transports easily.

## Install

```
npm i pino-abstract-transport
```

## Usage

```js
import build from 'pino-abstract-transport'

exports default async function (opts) {
  return build(async function (source) {
    for await (let obj of source) {
      console.log(obj)
    }
  })
}
```

or in CommonJS and streams:

```js
'use strict'

const build = require('pino-abstract-transport')

module.exports = function (opts) {
  return build(function (source) {
    source.on('data', function (obj) {
      console.log(obj)
    })
  })
}
```

## API

### build(fn, opts) => Stream

Create a [`split2`](http://npm.im/split2) instance and returns it.
This same instance is also passed to the given function, which is called
synchronously.

If `fn` returns a [`Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable), we will 
wrap that readable and the split2 instance using [`duplexify`](https://www.npmjs.com/package/duplexify),
so they can be concatenated into multiple transports.

#### Events emitted

In addition to all events emitted by a [`Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable)
stream, it emits the following events:

* `unknown` where an unparsaeble line is found, both the line and optional error is emitted.

#### Options

* `parse` an option to change to data format passed to build function. Default: `undefined`.

* `close(err, cb)` a function that is called to shutdown the transport. It's called both on error and non-error shutdowns.
  It can also return a promise. In this case discard the the `cb` argument.

* `parseLine(line)` a function that is used to parse line recieved from `pino`.

## Example

### custom parseLine

You can allow custom `parseLine` from users while providing a simple and safe default parseLine.

```js
'use strict'

const build = require('pino-abstract-transport')

function defaultParseLine (line) {
  const obj = JSON.parse(line)
  // property foo will be added on each line
  obj.foo = 'bar'
  return obj
}

module.exports = function (opts) {
  const parseLine = typeof opts.parseLine === 'function' ? opts.parseLine : defaultParseLine
  return build(function (source) {
    source.on('data', function (obj) {
      console.log(obj)
    })
  }, {
    parseLine: parseLine
  })
}
```

### Stream concatenation / pipeline

You can pipeline multiple transport as well.

```js
const build = require('pino-abstract-transport')
const { Transform, pipeline } = require('stream')

function buildTransform () {
  return build(function (source) {
    return new Transform({
      objectMode: true,
      autoDestroy: true,
      transform (line, enc, cb) {
        line.service = 'bob'
        cb(null, JSON.stringify(line))
      }
    })
  })
}

function buildDestination () {
  return build(function (source) {
    source.on('data', function (obj) {
      console.log(obj)
    })
  })
}

pipeline(buildTransform(), buildDestination(), function (err) {
  console.log('pipeline completed!, err)
})
```

## License

MIT
