'use strict'

const { once } = require('events')
const { Transform, pipeline } = require('stream')

const test = require('node:test')
const tspl = require('@matteo.collina/tspl')
const build = require('../')

test('parse newlined delimited JSON', (t) => {
  const { deepEqual } = tspl(t, { plan: 2 })
  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      deepEqual(line, expected.shift())
    })
  })

  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('parse newlined delimited JSON', (t) => {
  const { deepEqual } = tspl(t, { plan: 2 })
  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      deepEqual(line, expected.shift())
    })
  }, { parse: 'json' })

  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('null support', (t) => {
  const { deepEqual } = tspl(t, { plan: 1 })
  const stream = build(function (source) {
    source.on('unknown', function (line) {
      deepEqual(line, 'null')
    })
  })

  stream.write('null\n')
  stream.end()
})

test('broken json', async (t) => {
  const { deepEqual, completed } = tspl(t, { plan: 2 })
  const expected = '{ "truncated'
  const stream = build(function (source) {
    source.on('unknown', function (line, error) {
      deepEqual(line, expected)
      deepEqual('Unexpected end of JSON input', error.message)
    })
  })

  stream.write(expected + '\n')
  stream.end()
  await completed
})

test('pure values', (t) => {
  const { deepEqual, ok } = tspl(t, { plan: 3 })
  const stream = build(function (source) {
    source.on('data', function (line) {
      deepEqual(42, line.data)
      ok(line.time)
      deepEqual(line.time, new Date(line.time).getTime())
    })
  })

  stream.write('42\n')
  stream.end()
})

test('support async iteration', (t) => {
  const { deepEqual } = tspl(t, { plan: 2 })
  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(async function (source) {
    for await (const line of source) {
      deepEqual(line, expected.shift())
    }
  })

  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('rejecting errors the stream', async (t) => {
  const { deepEqual } = tspl(t, { plan: 1 })
  const stream = build(async function (source) {
    throw new Error('kaboom')
  })

  const [err] = await once(stream, 'error')
  deepEqual('kaboom', err.message)
})

test('set metadata', (t) => {
  const { deepEqual, equal } = tspl(t, { plan: 9 })

  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      const obj = expected.shift()
      deepEqual(obj.level, this.lastLevel)
      deepEqual(obj.time, this.lastTime)
      deepEqual(obj, this.lastObj)
      deepEqual(line, obj)
    })
  }, { metadata: true })

  equal(true, stream[Symbol.for('pino.metadata')])
  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('parse lines', (t) => {
  const { deepEqual, equal } = tspl(t, { plan: 9 })

  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      const obj = expected.shift()
      deepEqual(obj.level, this.lastLevel)
      deepEqual(obj.time, this.lastTime)
      deepEqual(obj, this.lastObj)
      deepEqual(line, JSON.stringify(obj))
    })
  }, { metadata: true, parse: 'lines' })

  equal(true, stream[Symbol.for('pino.metadata')])
  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('custom parse line function', (t) => {
  const { deepEqual, equal } = tspl(t, { plan: 11 })

  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]
  let num = 0

  function parseLine (str) {
    const obj = JSON.parse(str)
    deepEqual(obj, expected[num])
    return obj
  }

  const stream = build(function (source) {
    source.on('data', function (line) {
      const obj = expected[num]
      deepEqual(obj.level, this.lastLevel)
      deepEqual(obj.time, this.lastTime)
      deepEqual(obj, this.lastObj)
      deepEqual(line, obj)
      num++
    })
  }, { metadata: true, parseLine })

  equal(true, stream[Symbol.for('pino.metadata')])
  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('set metadata (default)', (t) => {
  const { deepEqual, equal } = tspl(t, { plan: 9 })

  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      const obj = expected.shift()
      deepEqual(obj.level, this.lastLevel)
      deepEqual(obj.time, this.lastTime)
      deepEqual(obj, this.lastObj)
      deepEqual(line, obj)
    })
  })

  equal(true, stream[Symbol.for('pino.metadata')])
  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('do not set metadata', (t) => {
  const { deepEqual, equal } = tspl(t, { plan: 9 })

  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      const obj = expected.shift()
      deepEqual(undefined, this.lastLevel)
      deepEqual(undefined, this.lastTime)
      deepEqual(undefined, this.lastObj)
      deepEqual(line, obj)
    })
  }, { metadata: false })

  equal(undefined, stream[Symbol.for('pino.metadata')])
  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('close logic', (t) => {
  const { deepEqual, ok } = tspl(t, { plan: 2 })
  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      deepEqual(line, expected.shift())
    })
  }, {
    close (err, cb) {
      ok(true, 'close called')
      process.nextTick(cb, err)
    }
  })

  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('close with promises', (t) => {
  const { deepEqual, ok } = tspl(t, { plan: 2 })
  const expected = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const stream = build(function (source) {
    source.on('data', function (line) {
      deepEqual(line, expected.shift())
    })
  }, {
    async close () {
      ok(true, 'close called')
    }
  })

  const lines = expected.map(JSON.stringify).join('\n')
  stream.write(lines)
  stream.end()
})

test('support Transform streams', async (t) => {
  const { deepEqual, ifError, completed } = tspl(t, { plan: 7 })

  const expected1 = [{
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'hello world'
  }, {
    level: 30,
    time: 1617955768092,
    pid: 2942,
    hostname: 'MacBook-Pro.local',
    msg: 'another message',
    prop: 42
  }]

  const expected2 = []

  const stream1 = build(function (source) {
    const transform = new Transform({
      objectMode: true,
      autoDestroy: true,
      transform (chunk, enc, cb) {
        deepEqual(chunk, expected1.shift())
        chunk.service = 'from transform'
        expected2.push(chunk)
        cb(null, JSON.stringify(chunk) + '\n')
      }
    })

    pipeline(source, transform, () => {})

    return transform
  }, { enablePipelining: true })

  const stream2 = build(function (source) {
    source.on('data', function (line) {
      deepEqual(line, expected2.shift())
    })
  })

  pipeline(stream1, stream2, function (err) {
    ifError(err)
    deepEqual([], expected1)
    deepEqual([], expected2)
  })

  const lines = expected1.map(JSON.stringify).join('\n')
  stream1.write(lines)
  stream1.end()
  await completed
})
