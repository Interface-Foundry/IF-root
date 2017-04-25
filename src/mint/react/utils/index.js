// react/utils/index.js

export {
  isValidEmail,
  isUrl,
  isRequired,
  minLength,
  maxLength,
  isInteger,
  oneOf,
  match,
  createValidator
}
from './validation';

export {
  timeFromDate
}
from './dates';

export {
  commaSeparateNumber,
  getNameFromEmail,
  addLinkToDeepLink,
  calculateItemTotal,
  displayCost
}
from './formating';

export {
  fakeStore
}
from './testUtils';

export {
  cloudinary
}
from './cloudinary';

export {
  getSearchHistory,
  addSearchHistory
}
from './search';
