import React, { Component } from 'react';
import { Icon } from '..';

const shareIcons = [
  {
    icon: 'FacebookMessenger',
    label: 'FB Messenger'
  },
  {
    icon: 'Facebook',
    label: 'Facebook'
  },
  {
    icon: 'Gmail',
    label: 'Email'
  },
  {
    icon: 'Sms',
    label: 'SMS'
  },
  {
    icon: 'Whatsapp',
    label: 'Whatsapp'
  },
  {
    icon: 'Slack',
    label: 'Slack'
  }
]

export default class Share extends Component {
  copy = (e) => {
    this.input.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.blur();
  }

  render() {
    const { location: { pathname } } = this.props;

    return (
      <div className='share'>
      	<div className='share__message'>
          <div className='share__message__imageText'>
            <div className='image' style={{backgroundImage:`url(http://tidepools.co/kip/head_smaller.png)`}}/>
            <p>I just sent you an email you can forward to others! or share this link:</p>
          </div>
          <div className='share__message__copy'>
            <div className='share__message__copy__input'>
              <input ref={(input) => this.input = input} value={`kipthis.com/c/${pathname.match(/cart\/((\d|\w)+)/)[1]}`} readOnly={true}/>
              <button onClick={this.copy}><p>copy</p></button>
            </div>
          </div>
      	</div>
      	<div className='share__icons'>
          {
            _.map(shareIcons, (icon, i) => (
              <div key={i} className='share__icons__icon'>
                <Icon icon={icon.icon}/>
                <label>{icon.label}</label>
              </div>
            ))
          }
      	</div>
      </div>
    );
  }
}
