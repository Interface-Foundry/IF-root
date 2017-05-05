// react/components/ErrorPage/ErrorPage.js

import React, { Component } from 'react';

export default class ErrorPage extends Component {
  render() {
    return (
      <div className='uhoh'> 
        <img className='faceplant' src='//storage.googleapis.com/kip-random/kip404.png'/> 
        <h1 className='ohno' data-heading="Ooops!"><span data-heading="Ooops!">Ooops!</span></h1>
      </div>
    );
  }
}
