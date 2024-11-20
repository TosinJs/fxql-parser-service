import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateFxqlStatementDto {
  @ApiProperty({
    description: 'FXQL statements',
  })
  @IsString()
  @IsNotEmpty()
  FXQL: string;
}
