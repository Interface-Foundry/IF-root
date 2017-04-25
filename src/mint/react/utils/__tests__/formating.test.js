// react/utils/__tests__/formating.test.js

import { commaSeparateNumber, getNameFromEmail } from '..';

describe('formating util', () => {
  describe('commaSeparateNumber', () => {
    const firstNumber = 1,
      secondNumber = 1000,
      thirdNumber = 1000000;

    it('should return original number if number < 1000', () => {
      expect(commaSeparateNumber(firstNumber))
        .toEqual(firstNumber);
    });

    it('should return comma seperated number as string if number > 1000', () => {
      expect(commaSeparateNumber(secondNumber))
        .toEqual('1,000');
      expect(commaSeparateNumber(thirdNumber))
        .toEqual('1,000,000');
    });
  });

  describe('getNameFromEmail', () => {
    const errorMessage = 'No valid email';

    it(`should return '${errorMessage}' if email undefined || null || ''`, () => {
      expect(getNameFromEmail())
        .toEqual(errorMessage);
      expect(getNameFromEmail(null))
        .toEqual(errorMessage);
      expect(getNameFromEmail(''))
        .toEqual(errorMessage);
    });

    it(`should return '${errorMessage}' if email is invalid'`, () => {
      expect(getNameFromEmail('peanuts'))
        .toEqual(errorMessage);
      expect(getNameFromEmail('peanuts@'))
        .toEqual(errorMessage);
      expect(getNameFromEmail('peanuts@mail'))
        .toEqual(errorMessage);
    });

    it('should return name before @ from email is valid', () => {
      expect(getNameFromEmail('peanuts@mail.com'))
        .toEqual('peanuts');
    });
  });
});
