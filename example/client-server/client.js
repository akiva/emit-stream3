const emitStream = require('../../')
const JSONStream = require('JSONStream')
const net = require('net')

const stream = net.connect(5555).pipe(JSONStream.parse([true]))
const ev = emitStream(stream)

ev.on('ping', t => console.log('# ping: ' + t))
ev.on('x', x => console.log('x = ' + x))
