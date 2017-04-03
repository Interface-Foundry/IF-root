import { timeFromDate } from '..'
import moment from 'moment'

describe('dates util', () => {

  describe('timeFromDate', () => {
    const firstDate = moment(),
      secondDate = moment()
      .add(2, 'minutes'),
      thirdDate = moment()
      .add(2, 'hours'),
      fourthDate = moment()
      .add(2, 'days');

    it('should return 'Just now' if diff is less then 1 minute', () => {
      expect(timeFromDate(firstDate))
        .toEqual('Just now')
    })

    it('should return difference in minutes if date is > 1 minute && < 1 hour', () => {
      expect(timeFromDate(secondDate))
        .toEqual(`${moment().diff(secondDate, 'minutes')} minutes ago`)
    })

    it('should return difference in hour if date is > 1 hour && < 1 day', () => {
      expect(timeFromDate(thirdDate))
        .toEqual(`${moment().diff(thirdDate, 'hours')} hours ago`)
    })

    it('should return difference in hour if date is > 1 day', () => {
      expect(timeFromDate(fourthDate))
        .toEqual(`${moment().diff(fourthDate, 'days')} days ago`)
    })
  })

})
