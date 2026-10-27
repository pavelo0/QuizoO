import request from 'supertest';
import { useApiApp } from '../support/hooks';

describe('health', () => {
  const api = useApiApp();

  it('отвечает на корневой маршрут', async () => {
    await request(api.getApp().getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('отдаёт health-check', async () => {
    await request(api.getApp().getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
