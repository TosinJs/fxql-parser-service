import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFxqlStatementDto {
  @IsString()
  @IsNotEmpty()
  FXQL: string;
}
