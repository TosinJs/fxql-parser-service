import { Injectable } from '@nestjs/common';
import { BadFxqlRequestErrorWithMessage } from '../../../utils/errorBuilder.utils';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

export class ParsedFxql {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  sourceCurrency: string;

  @ApiProperty()
  destinationCurrency: string;

  @ApiProperty()
  buyPrice: number;

  @ApiProperty()
  sellPrice: number;

  @ApiProperty()
  capAmount: number;
}

@Injectable()
export class FxqlParserService {
  parseFxqlStatement(fxql: string): ParsedFxql[] {
    const lines = fxql.trim().split('\\n');
    const currencyPairsMap: { [key: string]: ParsedFxql } = {};
    let currentEntry: Partial<ParsedFxql> | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle currency pair line
      if (trimmedLine.includes('-') && trimmedLine.endsWith('{')) {
        if (currentEntry) {
          throw new BadFxqlRequestErrorWithMessage(
            `Syntax error at line ${index + 1}: Unexpected opening of new FXQL block before closing the previous one.`,
          );
        }

        const [sourceCurrency, destinationCurrency] = trimmedLine
          .replace('{', '')
          .split('-')
          .map((c) => c.trim());

        this.validateCurrency(sourceCurrency, index + 1);
        this.validateCurrency(destinationCurrency, index + 1);

        currentEntry = { sourceCurrency, destinationCurrency };
      }

      // Handle closing brace
      else if (trimmedLine === '}') {
        if (!currentEntry || !this.isCompleteEntry(currentEntry)) {
          throw new BadFxqlRequestErrorWithMessage(
            `Syntax error at line ${index + 1}: Incomplete FXQL block.`,
          );
        }

        currentEntry.id = uuidv4();
        const key = `${currentEntry.sourceCurrency}-${currentEntry.destinationCurrency}`;
        currencyPairsMap[key] = currentEntry as ParsedFxql;
        currentEntry = null;
      }

      // Handle new currency input
      else if (trimmedLine === '') {
        if (currentEntry || Object.values(currencyPairsMap).length < 1) {
          throw new BadFxqlRequestErrorWithMessage(
            `Syntax error at line ${index + 1}: Incomplete FXQL block.`,
          );
        }
      }

      // Handle parameters
      else if (currentEntry) {
        const [key, value] = trimmedLine.split(/\s+/);

        switch (key) {
          case 'BUY':
            currentEntry.buyPrice = this.validateBuySell(
              value,
              index + 1,
              'BUY',
            );
            break;
          case 'SELL':
            currentEntry.sellPrice = this.validateBuySell(
              value,
              index + 1,
              'SELL',
            );
            break;
          case 'CAP':
            currentEntry.capAmount = this.validateCap(value, index + 1);
            break;
          default:
            throw new BadFxqlRequestErrorWithMessage(
              `Syntax error at line ${index + 1}: Unknown key '${key}'.`,
            );
        }
      }
      // Handle invalid scenarios
      else {
        throw new BadFxqlRequestErrorWithMessage(
          `Syntax error at line ${index + 1}: Unexpected line outside of FXQL block.`,
        );
      }
    });

    // Ensure no incomplete block remains
    if (currentEntry) {
      throw new BadFxqlRequestErrorWithMessage(
        `Syntax error: FXQL block was not closed.`,
      );
    }

    return Object.values(currencyPairsMap);
  }

  private validateCurrency(currency: string, line: number): void {
    if (currency.toUpperCase() !== currency || currency.length !== 3) {
      throw new BadFxqlRequestErrorWithMessage(
        `Syntax error at line ${line}: Invalid currency '${currency}'.`,
      );
    }
  }

  private validateBuySell(
    value: string,
    line: number,
    field: 'BUY' | 'SELL',
  ): number {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      throw new BadFxqlRequestErrorWithMessage(
        `Syntax error at line ${line}: Invalid value for ${field} '${value}'. Expected a positive number.`,
      );
    }
    return num;
  }

  private validateCap(value: string, line: number): number {
    const num = Number(value);
    if (
      isNaN(num) ||
      !Number.isInteger(num) ||
      num.toString() !== value.trim() ||
      num < 0
    ) {
      throw new BadFxqlRequestErrorWithMessage(
        `Syntax error at line ${line}: Invalid value for CAP '${value}'. Expected a non-negative integer.`,
      );
    }
    return num;
  }

  private isCompleteEntry(entry: Partial<ParsedFxql>): boolean {
    return (
      entry.sourceCurrency &&
      entry.destinationCurrency &&
      entry.buyPrice !== undefined &&
      entry.sellPrice !== undefined &&
      entry.capAmount !== undefined
    );
  }
}
