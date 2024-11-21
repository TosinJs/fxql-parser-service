import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DBInternalServerError } from '../../../utils/errorBuilder.utils';

@Injectable()
export class DatabaseFxqlStatementService {
  constructor(private prisma: PrismaService) {}

  async insertExchangeRates(data: Prisma.ExchangeRateCreateInput[]) {
    try {
      const upsertPromises = data.map((rate) =>
        this.prisma.exchangeRate.upsert({
          where: {
            sourceCurrency_destinationCurrency: {
              sourceCurrency: rate.sourceCurrency,
              destinationCurrency: rate.destinationCurrency,
            },
          },
          update: {
            id: rate.id,
            buyPrice: rate.buyPrice,
            sellPrice: rate.sellPrice,
            capAmount: rate.capAmount,
          },
          create: rate,
        }),
      );

      await Promise.all(upsertPromises);
    } catch (error) {
      throw new DBInternalServerError(
        error.message,
        'INTERNAL_SERVER_ERROR',
        'DB_ERROR',
      );
    }
  }
}
