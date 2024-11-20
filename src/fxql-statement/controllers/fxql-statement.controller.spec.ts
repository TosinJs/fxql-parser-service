import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FxqlStatementController } from './fxql-statement.controller';
import { FxqlStatementService } from '../services/fxql/fxql-statement.service';
import { DatabaseFxqlStatementService } from '../services/database/db.fxql.service';
import { FxqlParserService } from '../services/fxql-parser/fxql-parser.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFxqlStatementDto } from '../dto/create-fxql-statement.dto';
import { createResponse } from '../../utils/responseBuilder.utils';

describe('FxqlStatementController', () => {
  let controller: FxqlStatementController;
  let service: FxqlStatementService;

  const mockFxqlStatementService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxqlStatementController],
      providers: [
        {
          provide: FxqlStatementService,
          useValue: mockFxqlStatementService,
        },
        FxqlParserService,
        DatabaseFxqlStatementService,
        PrismaService,
      ],
    }).compile();

    controller = module.get<FxqlStatementController>(FxqlStatementController);
    service = module.get<FxqlStatementService>(FxqlStatementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createFxqlStatementDto: CreateFxqlStatementDto = {
      FXQL: 'value1',
    };

    it('should return a successful response on valid input', async () => {
      const mockData = { id: uuidv4(), ...createFxqlStatementDto };
      mockFxqlStatementService.create.mockResolvedValue(mockData);

      const result = await controller.create(createFxqlStatementDto);

      expect(result).toEqual(
        createResponse({ statusCode: HttpStatus.CREATED, data: mockData }),
      );
      expect(mockFxqlStatementService.create).toHaveBeenCalledWith(
        createFxqlStatementDto,
      );
    });

    it('should return a bad request response if validation fails', async () => {
      const validationError = new Error('Validation failed');
      mockFxqlStatementService.create.mockRejectedValue(validationError);

      try {
        await controller.create({} as CreateFxqlStatementDto);
      } catch (error) {
        expect(error.message).toBe('Validation failed');
      }

      expect(mockFxqlStatementService.create).toHaveBeenCalled();
    });
  });
});
