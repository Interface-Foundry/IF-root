import {
  isValidEmail,
  isRequired,
  minLength,
  maxLength,
  isInteger,
  oneOf,
  match
} from '..';

describe('validation util', () => {
  describe('isValidEmail', () => {
    it('should return false if value is undefined || null || \'\'', () => {
      expect(isValidEmail())
        .toEqual(false);
      expect(isValidEmail(null))
        .toEqual(false);
      expect(isValidEmail(''))
        .toEqual(false);
    });

    it('should return false if string does not contain @', () => {
      expect(isValidEmail('test'))
        .toEqual(false);
    });

    it('should return true if valid email', () => {
      expect(isValidEmail('test@gmail.com'))
        .toEqual(true);
    });
  });

  describe('isRequired', () => {
    it('should return \'Required\' if value is undefined || null || \'\'', () => {
      expect(isRequired())
        .toEqual('Required');
      expect(isRequired(null))
        .toEqual('Required');
      expect(isRequired(''))
        .toEqual('Required');
    });

    it('should not return if value is present', () => {
      expect(isRequired('testvalue'))
        .toEqual();
    });
  });

  describe('minLength', () => {
    const min = 10;
    const expectedReturn = 'Must be at least 10 characters';

    it('should return undefined if value is undefined || null || \'\'', () => {
      expect(minLength(min)())
        .toEqual();
      expect(minLength(min)(null))
        .toEqual();
      expect(minLength(min)(''))
        .toEqual();
    });

    it(`should return '${expectedReturn}' if value < min`, () => {
      expect(minLength(min)('hi'))
        .toEqual(expectedReturn);
    });

    it('should return not return if value > min', () => {
      expect(minLength(min)('komangwluce@gmail.com'))
        .toEqual();
    });
  });

  describe('maxLength', () => {
    const max = 10;
    const expectedReturn = 'Must be no more than 10 characters';

    it('should return undefined if value is undefined || null || \'\'', () => {
      expect(maxLength(max)())
        .toEqual();
      expect(maxLength(max)(null))
        .toEqual();
      expect(maxLength(max)(''))
        .toEqual();
    });

    it(`should return '${expectedReturn}' if value > max`, () => {
      expect(maxLength(max)('komangwluce@gmail.com'))
        .toEqual(expectedReturn);
    });

    it('should return not return if value < max', () => {
      expect(maxLength(max)('hi'))
        .toEqual();
    });
  });

  describe('isInteger', () => {
    const expectedReturn = 'Must be an integer';

    it('should not return if value is null', () => {
      expect(isInteger(null))
        .toEqual();
    });

    it(`should return '${expectedReturn}' if not a number`, () => {
      expect(isInteger('hi'))
        .toEqual(expectedReturn);
    });

    it(`should return '${expectedReturn}' if string contains number`, () => {
      expect(isInteger('hi1'))
        .toEqual(expectedReturn);
      expect(isInteger('hi 1'))
        .toEqual(expectedReturn);
    });

    it('should not return if value is number in string format', () => {
      expect(isInteger('1'))
        .toEqual();
    });

    it('should not return if value is number', () => {
      expect(isInteger(1))
        .toEqual();
    });
  });

  describe('oneOf', () => {
    const enumeration = ['pies', 'apples', 'cherries'];
    const expectedReturn = `Must be one of: ${enumeration.join(', ')}`;

    it(`should return '${expectedReturn}' if value is undefined || null || ''`, () => {
      expect(oneOf(enumeration)())
        .toEqual(expectedReturn);
      expect(oneOf(enumeration)(null))
        .toEqual(expectedReturn);
      expect(oneOf(enumeration)(''))
        .toEqual(expectedReturn);
    });

    it(`should return '${expectedReturn} if value is not present in enumeration`, () => {
      expect(oneOf(enumeration)('oranges'))
        .toEqual(expectedReturn);
    });

    it('should not return if value is present in enumeration', () => {
      expect(oneOf(enumeration)('pies'))
        .toEqual();
    });
  });

  describe('match', () => {
    const data = {
      pie: 'pastry',
      apple: 'fruit',
      cherries: 'fruit'
    };
    const expectedReturn = 'Do not match';

    it('should not return if no data passed', () => {
      expect(match('pie')('pastry'))
        .toEqual();
    });

    it(`should return '${expectedReturn}' if value does not match data`, () => {
      expect(match('pie')('fruit', data))
        .toEqual(expectedReturn);
    });

    it('should not return if value matches data', () => {
      expect(match('pie')('pastry', data))
        .toEqual();
    });
  });
});
