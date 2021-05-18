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
import build from 'pino-abstract-stream'

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

const build = require('pino-abstract-stream')

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

#### Events emitted

In addition to all events emitted by a [`Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable)
stream, it emits the following events:

* `unknown` where an unparsaeble line is found, both the line and optional error is emitted.

#### Options

* `close(err, cb)` a function that is called to shutdown the transport. It's called both on error and non-error shutdowns.
  It can also return a promise. In this case discard the the `cb` argument.

## License

MIT
