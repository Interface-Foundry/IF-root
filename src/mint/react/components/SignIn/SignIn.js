import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

import InputWithButton from './InputWithButton';

export default class SignIn extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    currentView: PropTypes.number.isRequired,
    changeKipFormView: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    animation: PropTypes.bool.isRequired,
    showSiblings: PropTypes.bool.isRequired
  }

  finalSubmit = e => {
    const { handleSubmit } = this.props;

    handleSubmit(e)
  }

  render() {
    const { handleSubmit, currentView, changeKipFormView } = this.props;
    const { finalSubmit } = this;

    return (
      <div className="modal">
        <form className='signIn' onSubmit={handleSubmit}>
          <div className='overlay top' onClick={() => changeKipFormView(1)}/>
          <div className={`signIn__container-${currentView}`}>
            <section className='signIn__container__page' id="one">
              <h1>Start New Group Cart</h1>
              <div className="signIn__container__page__input">
                <label htmlFor="email">1. Whats your Email Address</label>
                <Field name="email" component={InputWithButton} type="email" placeholder="Enter your email"/>
              </div>
            </section>
            <section className='signIn__container__page' id="two">
              <h1>Get Started by adding an item from Amazon</h1>
              <div className="signIn__container__page__input">
                <label htmlFor="url">2. Paste URL from Amazon</label>
                <Field name="url" component={InputWithButton} submit={finalSubmit} type="text" placeholder="Enter the link to an amazon product"/>
              </div>
            </section>
          </div>
          <div className='overlay bottom'/>
        </form>
      </div>
    );
  }
}
