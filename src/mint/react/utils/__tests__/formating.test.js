import { commaSeparateNumber } from '..'

describe('formating util', () => {

  describe('commaSeparateNumber', () => {
    const firstNumber = 1,
          secondNumber = 1000,
          thirdNumber = 1000000;

    it("should return original number if number < 1000", () => {
      expect(commaSeparateNumber(firstNumber))
        .toEqual(firstNumber)
    })

    it("should return comma seperated number as string if number > 1000", () => {
      expect(commaSeparateNumber(secondNumber))
        .toEqual('1,000')
      expect(commaSeparateNumber(thirdNumber))
        .toEqual('1,000,000')
    })

  })

})
