const test = require('tap').test
const emitStream = require('../')
const EventEmitter = require('events').EventEmitter
const net = require('net')
const JSONStream = require('JSONStream')

test('emit', t => {
  t.plan(1)

  const server = (function () {
    let ev
    const server = net.createServer(stream => {
      if (!ev) ev = createEmitter()
      const s = JSONStream.stringify()
      s.pipe(stream)
      emitStream(ev).pipe(s)
    })
    server.on('close', () => ev.stop())
    return server
  })()
  server.listen(5555)

  const collected = []

  server.on('listening', () => {
    const stream = net.connect(5555)
    const ev = emitStream(stream.pipe(JSONStream.parse([true])))
    ev.on('ping', t => collected.push('ping'))
    ev.on('x', x => collected.push(x))
    setTimeout(() => {
      t.same(collected, [
        0, 1, 2, 3, 'ping',
        4, 5, 6, 7, 'ping',
        8, 9, 10, 11, 'ping',
      ])
      stream.end()
    }, 320)
  })

  t.on('end', () => server.close())
})

function createEmitter () {
  const ev = new EventEmitter
  const intervals = []
  ev.stop = () => intervals.forEach(iv => clearInterval(iv))
  setTimeout(() => {
    intervals.push(setInterval(() => ev.emit('ping', Date.now()), 100))
  }, 5)
  let x = 0
  intervals.push(setInterval(() => ev.emit('x', x++), 25))
  return ev
}
