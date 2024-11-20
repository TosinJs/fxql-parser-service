import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
      console.log(error);
    }
  }
}
