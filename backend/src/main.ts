import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/uploads', express.static(join(__dirname, '../..', 'keystone/uploads/images')));

  app.use('/public', express.static(join(__dirname, '..', 'public')));
  app.use(express.static(join(__dirname, '../../client/dist')));

  app.setGlobalPrefix('api');

  // app.use(
  //   '/admin',
  //   createProxyMiddleware({
  //     target: 'http://localhost:3001',
  //     changeOrigin: true,
  //     pathRewrite: { '/admin': '/' },
  //   }),
  // );

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
    } else {
      res.sendFile(join(__dirname, '../../client/dist/index.html'));
    }
  });

  await app.listen(PORT, () => {
    console.log(`Nest application is ready on http://localhost:${PORT}`);
    // console.log(`Keystone admin UI is ready on http://localhost:${PORT}/admin`);
  });
}
bootstrap();