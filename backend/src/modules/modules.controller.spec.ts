import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

function createModulesServiceMock() {
  return {
    getRecentActivity: jest.fn(),
    createModule: jest.fn(),
    saveQuestionImage: jest.fn(),
    getQuestionImageForDownload: jest.fn(),
    clearQuestionImage: jest.fn(),
  } as unknown as ModulesService;
}

function createResponseMock(): Response {
  return {
    setHeader: jest.fn(),
  } as unknown as Response;
}

describe('ModulesController', () => {
  let controller: ModulesController;
  let modules: ReturnType<typeof createModulesServiceMock>;

  beforeEach(() => {
    modules = createModulesServiceMock();
    controller = new ModulesController(modules);
  });

  it('passes limit to recent activity service method', async () => {
    modules.getRecentActivity = jest.fn().mockResolvedValue([]);

    await controller.getActivity('u1', 15);

    expect(modules.getRecentActivity).toHaveBeenCalledWith('u1', 15);
  });

  it('delegates module creation payload to service', async () => {
    modules.createModule = jest
      .fn()
      .mockResolvedValue({ id: 'm1', title: 'Biology quiz' });

    await controller.create('u1', {
      title: 'Biology quiz',
      type: 'QUIZ' as never,
    });

    expect(modules.createModule).toHaveBeenCalledWith('u1', {
      title: 'Biology quiz',
      type: 'QUIZ',
    });
  });

  it('rejects image upload when multipart file is missing', async () => {
    expect(() =>
      controller.uploadQuestionImage('u1', 'm1', 'q1', undefined),
    ).toThrow(BadRequestException);
  });

  it('uploads question image through service with buffer and mime', async () => {
    modules.saveQuestionImage = jest
      .fn()
      .mockResolvedValue({ id: 'q1', questionImageMime: 'image/png' });

    await controller.uploadQuestionImage('u1', 'm1', 'q1', {
      buffer: Buffer.from('png-bytes'),
      mimetype: 'image/png',
    } as Express.Multer.File);

    expect(modules.saveQuestionImage).toHaveBeenCalledWith(
      'u1',
      'm1',
      'q1',
      expect.any(Buffer),
      'image/png',
    );
  });

  it('throws not found when question image is absent', async () => {
    modules.getQuestionImageForDownload = jest.fn().mockResolvedValue(null);

    await expect(
      controller.getQuestionImage(
        'u1',
        'm1',
        'q1',
        createResponseMock() as Response,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sets response headers and returns streamable image file', async () => {
    modules.getQuestionImageForDownload = jest.fn().mockResolvedValue({
      path: '/etc/hosts',
      mime: 'image/png',
    });
    const res = createResponseMock();

    const stream = await controller.getQuestionImage('u1', 'm1', 'q1', res);

    expect(res.setHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'image/png',
    );
    expect(res.setHeader).toHaveBeenNthCalledWith(
      2,
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    expect(res.setHeader).toHaveBeenNthCalledWith(3, 'Pragma', 'no-cache');
    expect(res.setHeader).toHaveBeenNthCalledWith(4, 'Expires', '0');
    expect(stream).toBeInstanceOf(StreamableFile);
  });
});
