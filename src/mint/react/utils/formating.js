import {
  isValidEmail
} from '.';

export const commaSeparateNumber = val => {
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString()
      .replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
  }
  return val;
};

export const getNameFromEmail = email => {
  if (isValidEmail(email)) {
    return email.split('@')[0];
  }

  return 'No valid email';
};


export const addLinkToDeepLink = (items, link) => {
  return _.map(items, (i, index) => {
    if(!i.deepLink) return i

    return {...i, deepLink: formatLinkForApp(i, link)}
  })
}

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
}