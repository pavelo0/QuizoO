import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { VerificationCodeDeliveryService } from '../../src/auth/verification-code-delivery.service';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(VerificationCodeDeliveryService)
    .useValue({
      emailVerification: () => Promise.resolve(),
      passwordReset: () => Promise.resolve(),
    })
    .compile();

  const app = moduleFixture.createNestApplication({ logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  await app.init();
  return app;
}
