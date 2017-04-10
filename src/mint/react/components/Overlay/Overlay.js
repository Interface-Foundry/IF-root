import React, { Component } from 'react';

export default class Overlay extends Component {
  render() {
    return (
      <div className='overlay'>
        <h1>Already signed up!</h1>
        <h4>Check your email for the magic link</h4>
        <p>Looks like your already signed up to this cart! Check out your email for the magic link</p>
      </div>
    );
  }
}