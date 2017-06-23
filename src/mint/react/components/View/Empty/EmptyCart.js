// mint/react/components/View/Empty/Empty.js

import React, { Component } from 'react';

export default class EmptyCart extends Component {

  render() {
    return (
      <td colSpan='100%' className='empty cart'>
        <div className='transparent'>
          <h4><span>Hello!</span><br></br><br></br>Start adding items to your Kip Cart by searching or pasting a product URL. <br></br><br></br> Invite others to add their items by tapping the Share Cart button 😊</h4>
          <br></br>
          <div className='image' style={{backgroundImage:'url(//storage.googleapis.com/kip-random/many_kips/presents_stare_sk.svg)'}}/>
        </div>
      </td>
    );
  }
}
