import React, { Component } from 'react';
import { Icon } from '..';
import { addLinkToDeepLink } from '../../utils';

import {
  ShareButtons
} from 'react-share';

const {
  FacebookShareButton
} = ShareButtons

const shareIcons = [
  {
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
]

export default class Share extends Component {
  openFailedHandler = () => {
    console.log('open failed, please instal app')
  }

  tryToOpen = route => {
    const { openFailedHandler } = this;

    setTimeout(openFailedHandler(route), 300);
  }

  copy = e => {
    this.input.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
  }

  render() {
    const { location: { pathname } } = this.props,
          linkedIcons = addLinkToDeepLink(shareIcons, `kipthis.com/c/${pathname.match(/cart\/((\d|\w)+)/)[1]}`);

    return (
      <div className='share'>
      	<div className='share__message'>
          <div className='share__message__imageText'>
            <div className='image' style={{backgroundImage:`url(http://tidepools.co/kip/head_smaller.png)`}}/>
            <p>I just sent you an email you can forward to others! or share this link:</p>
          </div>
          <div className='share__message__copy'>
            <div className='share__message__copy__input' onClick={this.copy}>
              <input ref={(input) => this.input = input} value={`kipthis.com/c/${pathname.match(/cart\/((\d|\w)+)/)[1]}`} readOnly={true}/>
              <button><p>copy</p></button>
            </div>
          </div>
      	</div>
      	<div className='share__icons'>
          {
            _.map(linkedIcons, (icon, i) => {
              if(icon.icon === 'Facebook') return (
                  <FacebookShareButton
                    url={`kipthis.com/c/${pathname.match(/cart\/((\d|\w)+)/)[1]}`}
                    title='Share Cart'
                    picture='http://tidepools.co/kip/head_smaller.png'
                    className="share__icons__icon">
                    <Icon icon={icon.icon}/>
                    <label>{icon.label}</label>
                  </FacebookShareButton>
                )

              return (
                <a href={icon.deepLink} key={i} className='share__icons__icon'>
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
