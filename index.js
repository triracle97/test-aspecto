const { context, setSpan, SpanKind, propagation, trace } = require('@opentelemetry/api');
const tracer = require('./tracing')
const mongoose = require('mongoose');
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let clientSocket = null
io.on('connection', (socket) => {
  console.log('a user connected');
  clientSocket = socket
});
const port = 3000

const kittySchema = new mongoose.Schema({
  name: String
});
const Kitten = mongoose.model('Kitten', kittySchema);

app.get('/', async (req, res) => {
  const fluffy = new Kitten({ name: 'fluffy' });
  await fluffy.save();
  const data = await Kitten.find({ name: /^fluff/ });
  console.log(data)
  await doSomeWorkInNewSpan()
  res.send('Hello World!')
})

const doSomeWorkInNewSpan = async () => {

  //const ctx = setSpan(context.active(), parentSpan);
  //const childSpan = tracer.startSpan('doWork', undefined, ctx);
  const childSpan = tracer.startSpan('doSomeWorkInNewSpan', {
    kind: SpanKind.PRODUCER,
    attributes: { 'code.function' : 'doSomeWorkInNewSpan' }
  }, context.active());
  const ctx = trace.setSpan(context.active(), childSpan)
  context.with(ctx, async () => {
    const data = {}
    propagation.inject(ctx, data)
    clientSocket.emit('sayHi', data, () => console.log('done'))
  })
  childSpan.setAttribute('code.filepath', "test");
  childSpan.end();
}

main().catch(err => console.log(err));

async function main() {
  server.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)
    await mongoose.connect('mongodb://localhost:27017/test');
  })
}

//aa6a41e4-cd1c-4093-953c-4d226ae50cd5
