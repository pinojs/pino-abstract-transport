# pino-abstract-transport

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

## License

MIT
