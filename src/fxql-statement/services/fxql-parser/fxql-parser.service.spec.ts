import { Test, TestingModule } from '@nestjs/testing';
import { FxqlParserService } from './fxql-parser.service';
import { BadFxqlRequestErrorWithMessage } from '../../../utils/errorBuilder.utils';

describe('FXQLParserService', () => {
  let parser: FxqlParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FxqlParserService],
    }).compile();

    parser = module.get<FxqlParserService>(FxqlParserService);
  });

  describe('parseFxqlStatement', () => {
    it('should parse a single valid currency pair', () => {
      const input = 'USD-GBP {\\n BUY 0.85\\n SELL 0.90\\n CAP 10000\\n}';
      const result = parser.parseFxqlStatement(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: expect.any(String),
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 0.85,
        sellPrice: 0.9,
        capAmount: 10000,
      });
    });

    it('should parse multiple valid currency pairs', () => {
      const input =
        'USD-GBP {\\n BUY 0.85\\n SELL 0.90\\n CAP 10000\\n}\\n\\nEUR-JPY {\\n BUY 145.20\\n SELL 146.50\\n CAP 50000\\n}';
      const result = parser.parseFxqlStatement(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: expect.any(String),
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 0.85,
        sellPrice: 0.9,
        capAmount: 10000,
      });
      expect(result[1]).toEqual({
        id: expect.any(String),
        sourceCurrency: 'EUR',
        destinationCurrency: 'JPY',
        buyPrice: 145.2,
        sellPrice: 146.5,
        capAmount: 50000,
      });
    });

    it('should keep only the latest entry for duplicate currency pairs', () => {
      const input =
        'USD-GBP {\\n BUY 0.85\\n SELL 0.90\\n CAP 10000\\n}\\n\\nUSD-GBP {\\n BUY 0.86\\n SELL 0.91\\n CAP 12000\\n}';
      const result = parser.parseFxqlStatement(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: expect.any(String),
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 0.86,
        sellPrice: 0.91,
        capAmount: 12000,
      });
    });

    it('should handle decimal values correctly', () => {
      const input = 'NGN-USD {\\n BUY 0.0022\\n SELL 0.0023\\n CAP 2000000\\n}';
      const result = parser.parseFxqlStatement(input);

      expect(result[0].buyPrice).toBe(0.0022);
      expect(result[0].sellPrice).toBe(0.0023);
    });

    it('should handle CAP values of 0', () => {
      const input = 'NGN-USD {\\n BUY 0.0022\\n SELL 0.0023\\n CAP 0\\n}';
      const result = parser.parseFxqlStatement(input);

      expect(result[0].buyPrice).toBe(0.0022);
      expect(result[0].sellPrice).toBe(0.0023);
      expect(result[0].capAmount).toBe(0);
    });
  });

  describe('parseFxqlStatement Error Handling', () => {
    const errorTestCases = [
      {
        name: 'Invalid currency case',
        input:
          'USD-GBP {\\n BUY 0.85\\n SELL 0.90\\n CAP 10000\\n}\\n\\nusd-GBP {\\n BUY 0.86\\n SELL 0.91\\n CAP 12000\\n}',
        errorMessage: `Syntax error at line 7: Invalid currency 'usd'.`,
      },
      {
        name: 'Invalid statement structure',
        input: 'USD-GBP BUY 100 SELL 200 CAP 93800',
        errorMessage:
          'Syntax error at line 1: Unexpected line outside of FXQL block.',
      },
      {
        name: 'Incomplete statement',
        input: 'USD-GBP {\\n BUY 100\\n SELL 200\\n',
        errorMessage: 'Syntax error: FXQL block was not closed.',
      },
      {
        name: 'Incomplete statement',
        input: 'USD-GBP {\\n BUY 100\\n SELL 200\\n',
        errorMessage: 'Syntax error: FXQL block was not closed.',
      },
      {
        name: 'Incomplete statement',
        input: 'USD-GBP {\\n BuY 100\\n SELL 200\\n',
        errorMessage: `Syntax error at line 2: Unknown key 'BuY'`,
      },
      {
        name: 'Invalid buy price',
        input: 'USD-GBP {\\n BUY abc\\n SELL 200\\n CAP 93800\\n}',
        errorMessage: `Syntax error at line ${'2'}: Invalid value for BUY 'abc'. Expected a positive number.`,
      },
      {
        name: 'Invalid sell price',
        input: 'USD-GBP {\\n BUY 200\\n SELL a00\\n CAP 3800\\n}',
        errorMessage: `Syntax error at line ${'3'}: Invalid value for SELL 'a00'. Expected a positive number.`,
      },
      {
        name: 'Negative cap amount',
        input: 'USD-GBP {\\n BUY 100\\n SELL 200\\n CAP -50\\n}',
        errorMessage: `Syntax error at line 4: Invalid value for CAP '-50'. Expected a non-negative integer.`,
      },
      {
        name: 'Decimal cap amount',
        input: 'USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 0.02\\n}',
        errorMessage: `Syntax error at line 4: Invalid value for CAP '0.02'. Expected a non-negative integer.`,
      },
    ];

    errorTestCases.forEach((testCase) => {
      it(`should throw error for ${testCase.name}`, () => {
        expect(() => parser.parseFxqlStatement(testCase.input)).toThrow(
          new BadFxqlRequestErrorWithMessage(testCase.errorMessage),
        );
      });
    });
  });
});
