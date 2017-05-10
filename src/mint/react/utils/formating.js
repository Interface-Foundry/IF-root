// react/utils/formating.js

import { isValidEmail } from '.';

export const commaSeparateNumber = (val, loc = undefined, opts = { maximumFractionDigits: 2 }) => {
  opts = {
    maximumFractionDigits: 2,
    ...opts
  };
  return val.toLocaleString(loc, opts);
};

export const displayCost = (val, loc = undefined, opts) => {
  opts = {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'USD',
    ...opts
  };
  return val.toLocaleString(loc, opts);
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
