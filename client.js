const tracer = require('./tracing1')
const { trace, context, ROOT_CONTEXT, propagation, SpanKind } = require('@opentelemetry/api')
const io = require('socket.io-client')
const socket = io.connect('http://localhost:3000')

socket.on('sayHi', (data, cb) => {
  const ctx = propagation.extract(ROOT_CONTEXT, data)
  setTimeout(() => {
    const span = tracer.startSpan('Client span', { kind: SpanKind.CONSUMER }, ctx)
    console.log('hi')
    span.end()
  }, 1000)
  cb()
})
