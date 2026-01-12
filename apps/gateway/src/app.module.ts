import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthGatewayMiddleware } from './auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'default-secret',
      }),
    }),
  ],
  providers: [AuthGatewayMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const services = [
      { route: '/api/auth', target: 'http://localhost:7081' },
      { route: '/api/content-types', target: 'http://localhost:7082' },
      { route: '/api/content', target: 'http://localhost:7083' },
      { route: '/api/upload', target: 'http://localhost:7084' },
      { route: '/api/permissions', target: 'http://localhost:7085' },
    ];

    consumer
      .apply(AuthGatewayMiddleware)
      .forRoutes(
        ...services.map(({ route }) => ({
          path: `${route}*`,
          method: RequestMethod.ALL,
        })),
      );

    services.forEach(({ route, target }) => {
      consumer
        .apply(
          createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (path) => path,
            timeout: 60000,
            proxyTimeout: 60000,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
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
