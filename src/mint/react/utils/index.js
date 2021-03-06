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
  numberOfItems,
  displayCost,
  removeDangerousCharactersFromString,
  splitAndMergeSearchWithCart,
  formatPrivacy,
  getStoreName,
  splitOptionsByType,
  addLinkToDesktop
}
from './formatting';

export {
  fakeStore
}
from './testUtils';

export {
  checkPageScroll,
  isScrolledIntoView
}
from './scroll';

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

export Timeout from './Timeout';

export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
