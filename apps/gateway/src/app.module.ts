import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const services = [
      { route: '/api/auth', target: 'http://localhost:8081' },
      { route: '/api/content-types', target: 'http://localhost:8082' },
      { route: '/api/content', target: 'http://localhost:8083' },
      { route: '/api/media', target: 'http://localhost:8084' },
      { route: '/api/permissions', target: 'http://localhost:8085' },
    ];

    services.forEach(({ route, target }) => {
      consumer
        .apply(
          createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (path) => path,
            timeout: 60000, // 60 second timeout
            proxyTimeout: 60000,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
              // Ensure body is forwarded
              if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            },
            onError: (err, req, res) => {
              console.error('Proxy error:', err.message);
              if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'Service unavailable' });
              }
            },
          }),
        )
        .forRoutes({ path: `${route}*`, method: RequestMethod.ALL });
    });
  }
}