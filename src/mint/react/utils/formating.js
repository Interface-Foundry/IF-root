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

export const calculateItemTotal = (items) => {
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const numberOfItems = (items) => {
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

export const removeDangerousCharactersFromString = (string) => {
  // const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  //   'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  //   'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'
  // ];
  return string;
};
