import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { FxqlStatementController } from '../src/fxql-statement/controllers/fxql-statement.controller';
import { FxqlStatementService } from '../src/fxql-statement/services/fxql/fxql-statement.service';
import { FxqlParserService } from '../src/fxql-statement/services/fxql-parser/fxql-parser.service';
import { DatabaseFxqlStatementService } from '../src/fxql-statement/services/database/db.fxql.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateFxqlStatementDto } from '../src/fxql-statement/dto/create-fxql-statement.dto';
import { AllExceptionsFilter } from '../src/utils/exceptions/all-exceptions.exception';

describe('FxqlStatementController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FxqlStatementController],
      providers: [
        FxqlStatementService,
        FxqlParserService,
        DatabaseFxqlStatementService,
        PrismaService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    app.useGlobalFilters(new AllExceptionsFilter());

    // Ensure database is reset before tests
    await prismaService.$executeRaw`TRUNCATE TABLE exchange_rates;`;
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /fxql-statement', () => {
    const validFxql = `NGN-USD {\\n BUY 100\\n SELL 200\\n CAP 0\\n}`;

    const invalidFxql = `USD-GBP {\\n BuY 100\\n SELL 200\\n `;

    it('should create a new FXQL statement (valid FXQL)', async () => {
      const dto: CreateFxqlStatementDto = { FXQL: validFxql };

      const response = await request(app.getHttpServer())
        .post('/fxql-statement')
        .send(dto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty(
        'code',
        `FXQL-${HttpStatus.CREATED}`,
      );
      expect(response.body).toMatchObject({
        code: 'FXQL-201',
        message: 'Rates Parsed Successfully.',
        data: [
          {
            id: expect.any(String),
            sourceCurrency: 'NGN',
            destinationCurrency: 'USD',
            buyPrice: 100,
            sellPrice: 200,
            capAmount: 0,
          },
        ],
      });

      // Verify database insertion
      const records = await prismaService.exchangeRate.findMany();
      expect(records).toHaveLength(1);
    });

    it('should return a 400 error for invalid FXQL', async () => {
      const dto: CreateFxqlStatementDto = { FXQL: invalidFxql };

      const response = await request(app.getHttpServer())
        .post('/fxql-statement')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty(
        'code',
        `FXQL-${HttpStatus.BAD_REQUEST}`,
      );
      expect(response.body.message).toContain(
        `Syntax error at line 2: Unknown key 'BuY'.`,
      );
    });

    it('should return a 500 error for database issues', async () => {
      jest
        .spyOn(prismaService.exchangeRate, 'createMany')
        .mockRejectedValueOnce(new Error('Database error'));

      const dto: CreateFxqlStatementDto = { FXQL: validFxql };

      const response = await request(app.getHttpServer())
        .post('/fxql-statement')
        .send(dto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });
});
