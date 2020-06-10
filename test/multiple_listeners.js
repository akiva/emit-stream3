const test = require('tap').test
const emitStream = require('../')
const EventEmitter = require('events').EventEmitter
const net = require('net')
const JSONStream = require('JSONStream')

test('emit to multiple listeners, close first', t => {
  t.plan(2)

  const duration = 50, events = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const server = JSONStreamServer(() =>
    emitLinear(new EventEmitter, 'ping', events, duration)
  )

  server.listen(5555)

  server.on('listening', () => {
    const s1_events = [], s2_events = []
    let s1_stream, s2_stream
    toEmitJSONStream(s1_stream = net.connect(5555))
      .on('ping', x => s1_events.push(x))
    setTimeout(() => s1_stream.end(), duration * 6.5)
    setTimeout(() =>
      toEmitJSONStream(s2_stream = net.connect(5555))
        .on('ping', x => s2_events.push(x))
      , duration * 3.5)
    setTimeout(() => {
      t.same(s1_events, [1, 2, 3, 4, 5, 6])
      t.same(s2_events, [4, 5, 6, 7, 8, 9, 10])
      s2_stream.end()
    }, duration * (events.length + 1))
  })

  t.on('end', () => server.close())
})

function JSONStreamServer(createEmitter) {
  let ev
  const server = net.createServer(stream => {
    if (!ev) ev = createEmitter()
    const es = emitStream(ev)
    es.pipe(JSONStream.stringify()).pipe(stream)
    stream.on('end', () => es.end())
  })
  server.on('close', () => ev.stop && ev.stop())
  return server
}

function emitLinear(ev, event_type, xs, duration) {
  xs = xs.slice().reverse()
  const iv = setInterval(() => xs.length
    ? ev.emit(event_type, xs.pop())
    : clearInterval(iv)
  , duration)
  return ev
}

function toEmitJSONStream(stream) {
  return emitStream(stream.pipe(JSONStream.parse([true])))
}
