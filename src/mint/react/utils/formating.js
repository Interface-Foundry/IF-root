// react/utils/formating.js

// import striptags from 'striptags';
import { isValidEmail } from '.';

export const commaSeparateNumber = (val, loc = undefined, opts = { maximumFractionDigits: 2 }) => {
  opts = {
    maximumFractionDigits: 2,
    ...opts
  };
  return val.toLocaleString(loc, opts);
};

export const displayCost = (val, currency) => {
  const opts = {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: currency === 'UK' ? 'GBP' : 'USD'
  };
  return val.toLocaleString({}, opts);
};

export const getNameFromEmail = email => {
  if (isValidEmail(email)) {
    return email.split('@')[0];
  }

  return 'No valid email';
};

export const addLinkToDeepLink = (items, link) => {
  return items.map((i, index) => {
    if (!i.deepLink) return i;

    return { ...i, deepLink: formatLinkForApp(i, link) };
  });
};

const formatLinkForApp = (app, link) => {
  switch (app.icon) {
  case 'FacebookMessenger':
    return app.deepLink.replace('link=', `link=${link}`);
  case 'Whatsapp':
    return app.deepLink.replace('text=', `text=${link}`);
  case 'Sms':
  case 'Gmail':
    return app.deepLink.replace('body=', `body=${link}`);
  default:
    return app.deepLink;
  }
};

const formatPrivacy = (lvl) => {
  switch (Number(lvl)) {
  case privacyLevels.PUBLIC:
    return 'public';
  case privacyLevels.PRIVATE:
    return 'private';
  case privacyLevels.DISPLAY:
    return 'display';
  default:
    throw `${lvl} is not a valid privacy level`;
  }
};

export const calculateItemTotal = (items) => {
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const numberOfItems = (items) => {
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

export const splitAndMergeSearchWithCart = (items, results, user) =>
  results.reduce((acc, result, i) => {
    let cartItem = items.filter((c) => c.asin === result.asin && user.id === c.added_by)[0];

    if (cartItem) {
      acc.push({
        ...result,
        id: cartItem.id,
        oldId: result.id,
        iframe_review_url: result.iframe_review_url,
        quantity: cartItem.quantity
      });
    } else {
      acc.push(result);
    }

    return acc;
  }, []);

export const removeDangerousCharactersFromString = (string) => {
  // const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  //   'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  //   'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'
  // ];
  return string;
};
