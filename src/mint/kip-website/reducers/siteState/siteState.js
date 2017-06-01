const initialState = {
  ribbon: {
    left: [{
      title: '',
      link: ''
    }],
    right: {
      loginText: '',
      newCartText: '',
      addToSlackText: ''
    }
  },
  header: {
    readMoreText: ''
  },
  hero: {
    headline: '',
    description: '',
    buttonText: '',
    slackText: '',
    subtext: [],
    learnMore: '',
    imgUrl: '//storage.googleapis.com/kip-random/website/kip_collect.gif'
  },
  services: {
    tagline: '',
    tagDescrip: '',
    details: {
      descrips: [],
      actionText: '',
      slackActionText: ''
    }
  },
  compare: {
    tagline: '',
    subHead: '',
    buttonText: '',
    slackButtonText: '',
    categories: [],
    competitors: [{ image: '', data: [] }]
  },
  footer: {
    links: []
  },
  help: {
    titleText: '',
    stepText: '',
    images: [],
    faq: {
      title: '',
      subtext: '',
      qs: []
    }
  },
  blog: {
    titleText: '',
    subtext: []
  },
  about: {
    titleText: '',
    subtext: [],
    seenIn: '',
    why: {
      head: '',
      description: '',
      actionText: '',
      reasons: []
    }
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'GOT_SITE':
    return {
      ...action.response
    };
  default:
    return state;
  }
}