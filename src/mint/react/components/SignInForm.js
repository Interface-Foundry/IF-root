import React, { PropTypes } from 'react';

const SignInForm = ({ cart_id, onSubmit }) => {
  return (
    <form onSubmit={e => onSubmit(e, {cart_id: cart_id, email: e.target.querySelector('input').value})}>
		<input placeholder='Enter your email' name='email' type='text'/>
		<input type='hidden' name='cart_id' value={cart_id} />
      	<button type='Submit'>
        	Sign Up
      	</button>
    </form>
  );
};

export default SignInForm;
