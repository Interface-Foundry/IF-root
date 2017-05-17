// react/components/Overlay/Overlay.js

import React, { Component } from 'react';

export default class Overlay extends Component {
  render() {
    return (
      <div className='overlay'>
      	<div className='image' style={{backgroundImage:'url(https://storage.googleapis.com/kip-random/cafe_success.gif)'}}/>
        <h1>Already signed up!</h1>
        <h4><span>Check your email for the magic link</span></h4>
        <p>Looks like your already signed up to this cart! Check out your email for the magic link</p>
      </div>
    );
  }
}
