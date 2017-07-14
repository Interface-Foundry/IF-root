// react/utils/formatting.js

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
    currency: currency === 'GB' ? 'GBP' : 'USD'
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

export const addLinkToDesktop = (links, url) => {
  return links.map((i, index) => {
    if (!i.link) return i;
    return { ...i, link: formatLinkForDesktop(i, url) };
  });
};
const formatLinkForDesktop = (socialPlatforms, url) => {
  switch(socialPlatforms.icon) {
    case 'Facebook':
      return socialPlatforms.link.replace('display=',`display=page&href=${url}&redirect_uri=${url}`);
    case 'Twitter':
      return socialPlatforms.link.replace('url=',`url=${url}`);
    case 'Gmail':
      return socialPlatforms.link.replace('body=',`url=${url}`);
    case 'Pinterest':
      return socialPlatforms.link.replace('url=',`url=${url}&description=KipCart`);
    default:
      return socialPlatforms.link;
  }
}

export const calculateItemTotal = (items) => {
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const numberOfItems = (items) => {
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

export const splitAndMergeSearchWithCart = (items, results, user) => results.reduce((acc, result, i) => {
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

export const splitOptionsByType = (options = []) => {
  return options.reduce((acc, option) => {
    if(!acc[option.type]) acc[option.type] = [{id: option.id, asin: option.asin, main_image_url: option.main_image_url, name: option.name}];
    else acc[option.type].push({id: option.id, asin: option.asin, main_image_url: option.main_image_url, name: option.name});
    if(option.selected) acc[option.type].selected = option.asin;
    return acc;
  }, {});
};

export const removeDangerousCharactersFromString = (string) => {
  // const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  //   'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  //   'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'
  // ];
  return string;
};

export const getStoreName = (store, store_locale) => {
  if (store === 'YPO') {
    return 'YPO.co.uk';
  } else if (store === 'Amazon') {
    switch (store_locale) {
    case 'GB':
      return 'Amazon.co.uk';
    case 'CA':
      return 'Amazon.ca';
    default:
      return 'Amazon.com';
    }
  } else {
    return '';
  }
};
