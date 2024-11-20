import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DBInternalServerError } from '../../../utils/errorBuilder.utils';

@Injectable()
export class DatabaseFxqlStatementService {
  constructor(private prisma: PrismaService) {}

  async insertExchangeRates(data: Prisma.ExchangeRateCreateInput[]) {
    try {
      await this.prisma.exchangeRate.createMany({
        data,
        skipDuplicates: true,
      });

      return;
    } catch (error) {
      throw new DBInternalServerError(
        error.message,
        'INTERNAL_SERVER_ERROR',
        'DB_ERROR',
      );
    }
  }
}
