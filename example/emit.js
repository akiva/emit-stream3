const emitStream = require('../')
const EventEmitter = require('events').EventEmitter
const JSONStream = require('JSONStream')
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

server.on('listening', () => {
  const stream = net.connect(5555).pipe(JSONStream.parse([true]))
  const ev = emitStream(stream)
  ev.on('ping', t => console.log('# ping: ' + t))
  ev.on('x', x => console.log('x = ' + x))
})

function createEmitter () {
  const ev = new EventEmitter
  setInterval(() => ev.emit('ping', Date.now()), 2000)
  let x = 0
  setInterval(() => ev.emit('x', x++), 500)
  return ev
}
