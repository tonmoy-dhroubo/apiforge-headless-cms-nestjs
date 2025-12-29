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
          }),
        )
        .forRoutes({ path: `${route}*`, method: RequestMethod.ALL });
    });
  }
}