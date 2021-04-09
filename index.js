'use strict'

const split = require('split2')

module.exports = function build (fn) {
  const stream = split(function (line) {
    let value

    try {
      value = JSON.parse(line)
    } catch (error) {
      this.emit('unknown', line, error)
      return
    }

    if (value === null) {
      this.emit('unknown', line, 'Null value ignored')
      return
    }

    if (typeof value !== 'object') {
      value = {
        data: value,
        time: new Date().toISOString()
      }
    }

    return value
  })

  let res = fn(stream)

  if (res && typeof res.catch === 'function') {
    res.catch((err) => {
      stream.destroy(err)
    })

    // set it to null to not retain a reference to the promise
    res = null
  }

  return stream
}
