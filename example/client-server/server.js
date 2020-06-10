const emitStream = require('../../')
const JSONStream = require('JSONStream')
const EventEmitter = require('events').EventEmitter
const net = require('net')

const server = (function () {
  const ev = createEmitter()
  return net.createServer(stream =>
    emitStream(ev)
      .pipe(JSONStream.stringify())
      .pipe(stream)
  )
})()

server.listen(5555)

function createEmitter () {
  const ev = new EventEmitter
  setInterval(() => ev.emit('ping', Date.now()), 2000)
  let x = 0
  setInterval(() => ev.emit('x', x ++), 500)
  return ev
}
