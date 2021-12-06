const { NodeTracerProvider } = require('@opentelemetry/node');
const { Resource } = require('@opentelemetry/resources');
const opentelemetry = require('@opentelemetry/api')
const {registerInstrumentations} = require('@opentelemetry/instrumentation')
const { BatchSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { MongoDBInstrumentation } = require('@aspecto/opentelemetry-instrumentation-mongodb')
const { SocketIoInstrumentation } = require('opentelemetry-instrumentation-socket.io');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const options = {
  tags: [], // optional
  // You can use the default UDPSender
  host: 'localhost', // optional
  port: 6832, // optional
  // OR you can use the HTTPSender as follows
  // endpoint: 'http://localhost:14268/api/traces',
  maxPacketSize: 65000 // optional
}
const exporter = new JaegerExporter(options);

const provider = new NodeTracerProvider({
  resource: new Resource({
    'service.name': 'test-aspecto-client' // service.name is required
  }),
});

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new MongoDBInstrumentation(),
    new SocketIoInstrumentation()
  ]
});

provider.register();
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

const tracer = opentelemetry.trace.getTracer('test-aspecto-client')
module.exports = tracer
