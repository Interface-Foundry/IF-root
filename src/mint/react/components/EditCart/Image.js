// react/components/EditCart/Image.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../../react-common/components';

class Image extends Component {
  static propTypes = {
    input: PropTypes.object
  }
  render() {
    const { input } = this.props, { onChange, value } = input;

    return (
      <ul className="cartImage input-row">
        <li>
          <label className={`upload ${value ? '' : 'empty'}`}>
            <div>
              <div className='image column-2' style={
                {
                  backgroundImage: `url(${value ? value : '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`,
                backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain'
                }}/>
                <div className='cartImage__editButton'>
                  <Icon icon='Camera' />
                  <p>edit</p>
                </div>
            </div>
            <input
                type="file"
                onChange={( e ) => {      
                    e.preventDefault();
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = e => {
                  const fileSrc = reader.result;
                      onChange(fileSrc);
                };
            }}/>
          </label>
        </li>
      </ul>
    );
  }
}

export default Image;
