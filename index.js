const EventEmitter = require('events').EventEmitter
const through = require('through2')

module.exports = ev => typeof ev.pipe === 'function'
  ? fromStream(ev)
  : toStream(ev)

function toStream (ev) {
  const s = through.obj(
    function write (chunk, enc, cb) {
      this.emit('data', chunk)
      cb()
    },
    function end (cb) {
      const ix = ev._emitStreams.indexOf(s)
      ev._emitStreams.splice(ix, 1)
      cb()
    }
  )

  if (!ev._emitStreams) {
    ev._emitStreams = []
    const emit = ev.emit
    ev.emit = function () {
      const args = [].slice.call(arguments)
      ev._emitStreams.forEach(function (es) {
        es.writable && es.write(args)
      })
      emit.apply(ev, arguments)
    }
  }
  ev._emitStreams.push(s)
  return s
}

function fromStream (s) {
  const ev = new EventEmitter
  s.pipe(through.obj(function (chunk, enc, cb) {
    ev.emit.apply(ev, chunk)
    cb()
  }))
  return ev
}
