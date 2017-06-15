// react/reducers/__tests__/deals.test.js

import reducer from '../Deals';

import { RECEIVE_DEALS, REQUEST_DEALS } from '../../constants/ActionTypes';

const initialState = [];

const deals = [{
  'original_name': 'Diablo III',
  'name': 'Diablo III ',
  'asin': 'B00178630A',
  'price': 29.99,
  'previousPrice': 18.03,
  'category': 'Video Games',
  'small': 'https://images-na.ssl-images-amazon.com/images/I/41kXCp%2BUyeL._SL75_.jpg',
  'medium': 'https://images-na.ssl-images-amazon.com/images/I/41kXCp%2BUyeL._SL160_.jpg',
  'large': 'https://images-na.ssl-images-amazon.com/images/I/41kXCp%2BUyeL.jpg',
  'url': 'https://www.amazon.com/Diablo-III-Pc/dp/B00178630A?psc=1&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B00178630A',
  'savePercent': -0.66,
  'active': true,
  'createdAt': '2017-03-31T18:12:43.845Z',
  'updatedAt': '2017-03-31T18:12:44.029Z',
  'id': '58de9c1be014862c201e3018'
}, {
  'original_name': 'North States Superyard 3-in-1 Metal Gate',
  'name': 'North States Superyard 3-in-1 Metal Gate ',
  'asin': 'B000U5FOT2',
  'price': 99.87,
  'previousPrice': 114.06,
  'category': 'Baby Product',
  'small': 'https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL._SL75_.jpg',
  'medium': 'https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL._SL160_.jpg',
  'large': 'https://images-na.ssl-images-amazon.com/images/I/41vcBDMs4BL.jpg',
  'url': 'https://www.amazon.com/North-States-Superyard-Metal-Gate/dp/B000U5FOT2?psc=1&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B000U5FOT2',
  'savePercent': 0.12,
  'active': true,
  'createdAt': '2017-03-31T18:12:46.678Z',
  'updatedAt': '2017-03-31T18:12:46.717Z',
  'id': '58de9c1ee014862c201e3061'
}];

describe('deals reducer', () => {
  const firstState = initialState;

  it('should return the initial state', () => {
    expect(reducer(firstState, {}))
      .toEqual(firstState);
  });

  it('should return an unchanged state', () => {
    expect(reducer(firstState, { type: REQUEST_DEALS }))
      .toEqual(firstState);
  });

  it('should return an array of deals', () => {
    expect(reducer(firstState, { type: RECEIVE_DEALS, deals }))
      .toEqual({ deals });
  });
});
