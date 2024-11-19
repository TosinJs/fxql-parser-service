import { Injectable, BadRequestException } from '@nestjs/common';

interface ParsedFXQL {
  sourceCurrency: string;
  destinationCurrency: string;
  buyPrice: number;
  sellPrice: number;
  capAmount: number;
}

@Injectable()
export class FXQLParserService {
  parseFXQLStatement(fxql: string): ParsedFXQL[] {
    const lines = fxql.trim().split('\n');
    const currencyPairsMap: { [key: string]: ParsedFXQL } = {};
    let currentEntry: Partial<ParsedFXQL> | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle currency pair line
      if (trimmedLine.includes('-') && trimmedLine.endsWith('{')) {
        if (currentEntry) {
          throw new BadRequestException(
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
          throw new BadRequestException(
            `Syntax error at line ${index + 1}: Incomplete FXQL block.`,
          );
        }

        const key = `${currentEntry.sourceCurrency}-${currentEntry.destinationCurrency}`;
        currencyPairsMap[key] = currentEntry as ParsedFXQL;
        currentEntry = null;
      }

      // Handle new currency input
      else if (trimmedLine === '') {
        if (currentEntry || Object.values(currencyPairsMap).length < 1) {
          throw new BadRequestException(
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
            throw new BadRequestException(
              `Syntax error at line ${index + 1}: Unknown key '${key}'.`,
            );
        }
      }
      // Handle invalid scenarios
      else {
        throw new BadRequestException(
          `Syntax error at line ${index + 1}: Unexpected line outside of FXQL block.`,
        );
      }
    });

    // Ensure no incomplete block remains
    if (currentEntry) {
      throw new BadRequestException(`Syntax error: FXQL block was not closed.`);
    }

    return Object.values(currencyPairsMap);
  }

  private validateCurrency(currency: string, line: number): void {
    if (currency.toUpperCase() !== currency || currency.length !== 3) {
      throw new BadRequestException(
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
      throw new BadRequestException(
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
      throw new BadRequestException(
        `Syntax error at line ${line}: Invalid value for CAP '${value}'. Expected a non-negative integer.`,
      );
    }
    return num;
  }

  private isCompleteEntry(entry: Partial<ParsedFXQL>): boolean {
    return (
      entry.sourceCurrency &&
      entry.destinationCurrency &&
      entry.buyPrice !== undefined &&
      entry.sellPrice !== undefined &&
      entry.capAmount !== undefined
    );
  }
}
