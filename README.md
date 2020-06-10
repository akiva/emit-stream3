# emit-stream3

Turn event emitters into streams and streams into event emitters. Streams3 
version of [emit-stream](https://www.npmjs.com/package/emit-stream).

[![Build Status](https://travis-ci.com/akiva/emit-stream3.svg?branch=master)](https://travis-ci.com/akiva/emit-stream3)

## Usage

Borrowing from the original `README`, let's write a server that streams 
an event emitter's _events_ to clients:

```js
const emitStream = require('emit-stream3')
const JSONStream = require('JSONStream')
const net = require('net')
const EventEmitter = require('events').EventEmitter

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
```

Then re-constitute the event emitters on the client:

``` js
const emitStream = require('emit-stream3')
const net = require('net')
const stream = net.connect(5555).pipe(JSONStream.parse([true]))
const ev = emitStream(stream)

ev.on('ping', t => console.log('# ping: ' + t))
ev.on('x', x => console.log('x = ' + x))
```

Outputting:

``` 
$ node example/emit.js 
x = 0 
x = 1 
x = 2 
x = 3 
# ping: 1346116850523
x = 4 
x = 5 
^C 
```

## API

``` js
const emitStream = require('emit-stream3')
```

### emitStream(x)

If `x` is a stream, returns an event emitter from `emit.toStream(x)`. 
Otherwise, it returns a stream from `emit.fromStream(x)`.

### emitStream.toStream(emitter)

Return a stream from the EventEmitter `emitter`.

The `'data'` emitted by this stream will be an array. Serialization is 
up to you. I recommend [JSONStream](http://github.com/dominictarr/JSONStream) 
for most purposes.

### emitStream.fromStream(stream)

Return an EventEmitter from `stream`.

The `'data'` written to this stream should be an array, like 
[JSONStream](http://github.com/dominictarr/JSONStream) creates.

## Installation

With [npm](http://npmjs.org) do:

```
npm install emit-stream3
```

## License

[MIT](./LICENSE)
