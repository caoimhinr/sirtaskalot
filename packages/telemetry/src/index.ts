import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const provider = new BasicTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'sirtaskalot-web',
  }),
});

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://jaeger:4318/v1/traces',
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = trace.getTracer('sirtaskalot');

export type UserActionEvent = {
  action: string;
  userId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function trackUserAction(event: UserActionEvent) {
  return tracer.startActiveSpan(`user-action:${event.action}`, async (span) => {
    span.setAttribute('user.action', event.action);
    if (event.userId) span.setAttribute('user.id', event.userId);
    Object.entries(event.metadata ?? {}).forEach(([key, value]) => {
      if (value !== null) span.setAttribute(`event.${key}`, value as string | number | boolean);
    });
    span.end();
    return event;
  });
}
