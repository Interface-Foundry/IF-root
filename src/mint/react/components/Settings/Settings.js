// react/components/Settings/Settings.js

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Icon } from '..';

export default class Settings extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    currentUser: PropTypes.object,
  }
  state = {
    editName: false,
    editMail: false
  }

  _editName() {
    this.setState({
      editName: true
    });
  }

  _editMail() {
    this.setState({
      editMail: true
    });
  }

  _saveName() {
    this.setState({
      editName: false
    });
  }

  _saveMail() {
    this.setState({
      editMail: false
    });
  }

  render() {
    const { props: { cart_id, currentUser: { name, email_address } }, state: { editName, editMail } } = this;
    return (
      <div className='settings'>
        <ul>
          { 
            editName
              ? <li>
                  Name: <input autoFocus type='text' required placeholder='Name' value={name}/>
                  <button onClick={::this._saveName}> Save </button>
                </li>
              : <li onClick={::this._editName}><p>{name}  &nbsp;<Icon icon='Edit'/></p></li>
          }
          { 
            editMail
              ? <li>
                  Email: <input autoFocus type='text' required placeholder='Email' value={email_address}/>
                  <button onClick={::this._saveMail}> Save </button>
                </li>
              : <li onClick={::this._editMail}><p>{email_address}  &nbsp;<Icon icon='Edit'/></p></li>
          }
          
          <li><Link to={`/cart/${cart_id}/m/Feedback`}><Icon icon='Email'/> &nbsp; Send Feedback</Link></li>
        </ul>
        <h4>Kip Version 1.3 (Mint)</h4>
      </div>
    );
  }
}
