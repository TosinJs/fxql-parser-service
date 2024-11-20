import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../services/app.service';
import { DatabaseFxqlStatementService } from '../../fxql-statement/services/database/db.fxql.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, DatabaseFxqlStatementService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return "OK!"', () => {
      expect(appController.getHealth()).toBe('OK!');
    });
  });
});
