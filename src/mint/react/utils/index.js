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
  displayCost,
  removeDangerousCharactersFromString
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
  getLastSearch,
  addSearchHistory
}
from './search';

export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
