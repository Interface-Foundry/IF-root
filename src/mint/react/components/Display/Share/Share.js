// react/components/Share/Share.js
import React, { Component } from 'react';
import { Icon } from '../../../../react-common/components';
import { addLinkToDesktop, addLinkToDeepLink } from '../../../utils';
import PropTypes from 'prop-types';
import {
  ShareButtons
} from 'react-share';
const {
  FacebookShareButton
} = ShareButtons;
const shareIconsForMobile = [{
    icon: 'FacebookMessenger',
    label: 'FB Messenger',
    deepLink: 'fb-messenger://share?link=&app_id=' + encodeURIComponent(1401271990193674)
  },
  {
    icon: 'Facebook',
    label: 'Facebook'
  },
  {
    icon: 'Gmail',
    label: 'Email',
    deepLink: 'mailto:?subject=KipCart&body='
  },
  {
    icon: 'Sms',
    label: 'SMS',
    deepLink: 'sms:?&body='
  },
  {
    icon: 'Whatsapp',
    label: 'Whatsapp',
    deepLink: 'whatsapp://send?text='
  }
];
const shareIconsForDesktop = [{
    icon: 'Facebook',
    label: 'Facebook',
    link: 'https://www.facebook.com/dialog/share?app_id='+encodeURIComponent(1401271990193674)+'&display='
  },
  {
    icon: 'Twitter',
    label: 'Twitter',
    link: 'https://twitter.com/intent/tweet?url=&text=KipCart'
  },
  {
    icon: 'Pinterest',
    label: 'Pinterest',
    link: 'http://pinterest.com/pin/create/button/?url='
  },
  {
    icon: 'Gmail',
    label: 'Email',
    link: 'mailto:?subject=KipCart&body='
  }
]
// IOS, for facebook
export default class Share extends Component {
  static propTypes = {
    location: PropTypes.object
  }
  openFailedHandler = () => {
    if (navigator.userAgent.toLowerCase()
      .indexOf('android') > -1) {
      window.location.href = 'http://play.google.com/store/apps';
    } else if (navigator.userAgent.toLowerCase()
      .indexOf('iphone') > -1) {
      window.location.href = 'http://itunes.apple.com';
    } else {
      window.location.href = 'http://itunes.apple.com';
    }
  }
  tryToOpen = route => {
    const { openFailedHandler } = this;
    setTimeout(openFailedHandler(), 2000);
  }
  copy = e => {
    this.input.select();
    document.execCommand('copy');
  }
  render() {
    const { location: { pathname } } = this.props, { tryToOpen } = this;
    let shareUrl = window.location.href.match(/(.+)\/m\//);
    shareUrl = shareUrl ? shareUrl[1] : `http://kipthis.com/cart/${pathname.match(/cart\/((\d|\w)+)/)[1]}`;
    const linkedIcons = addLinkToDeepLink(shareIconsForMobile, shareUrl);
    const desktopIcons = addLinkToDesktop(shareIconsForDesktop, shareUrl);
    
    return (
      <div className='share'>
        <div className='share__message'>
          <div className='share__message__imageText'>
            <div className='image' style={{backgroundImage:'url(//storage.googleapis.com/kip-random/head_smaller.png)'}}/>
          </div>
          <div className='share__message__copy'>
            <div className='share__message__copy__input' onClick={this.copy}>
              <input ref={(input) => this.input = input} value={shareUrl} readOnly={true}/>
              <button><p>copy</p></button>
            </div>
          </div>
        </div>
        <div className='share__icons'>
          { //check if its mobile or desktop, if mobile then deepLink else desktop links
            //add link for desktop and twitter
            (screen.width < 600)
            ? linkedIcons.map((icon, i) => {
                if(icon.icon === 'Facebook') return (
                    <FacebookShareButton
                      key={i} 
                      url={shareUrl}
                      title='Share Cart'
                      picture='//storage.googleapis.com/kip-random/head_smaller.png'
                      className="share__icons__icon">
                      <Icon icon={icon.icon}/>
                      <label>{icon.label}</label>
                    </FacebookShareButton>
                  );
                return ( 
                   <a href={icon.deepLink} key={i} className='share__icons__icon' onClick={() => tryToOpen(icon.icon)}>
                      <Icon icon={icon.icon}/>
                      <label>{icon.label}</label>
                     </a>
                   );
              })
            : desktopIcons.map((icon, i) => {
                return (
                          <a href={icon.link} key={i} className={`share__icons__icon ${icon.label}`} target="_blank">
                            <Icon icon={icon.icon}/>
                            <label>{icon.label}</label>
                          </a>
                        )
              })               
          }
        </div>
      </div>
    );
  }
}