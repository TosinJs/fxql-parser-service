import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternalServerError } from 'src/utils/errorBuilder.utils';

@Injectable()
export class DatabaseFxqlStatementService {
  constructor(private prisma: PrismaService) {}

  async insertFxqlStatement(data: Prisma.FxqlStatementCreateManyInput[]) {
    try {
      await this.prisma.fxqlStatement.createMany({
        data,
        skipDuplicates: true,
      });

      return;
    } catch (error) {
      throw new InternalServerError(error.message, 'DB_ERROR');
    }
  }
}
