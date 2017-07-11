// mint/react/components/View/Results/Default.js
import React, { Component } from 'react';

export default class LoadingTile extends Component {

  render() {
    return (
      <td>
        <div className='card'>
          <div className='card__loading'>
            <div className='overlay vertical'/>
            <div className='overlay photo-bottom'/>
            <div className='overlay top'/>
            <div className='overlay bottom'/>
            <div className='overlay bottom empty-text'/>
            <div className='overlay mid'/>
            <div className='overlay right'/>
            <div className='overlay price-right'/>
          </div>
        </div>
      </td>
    );
  }
}
