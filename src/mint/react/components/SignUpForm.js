import React, { PropTypes } from 'react'

const SignUpForm = ({ cart_id, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
		<input placeholder='Enter your email' name='email' type='text'/>
		<input type='hidden' name='cart_id'>{cart_id}</input>
      	<button type='Submit'>
        	Sign Up
      	</button>
    </form>
  )
}

export default SignUpForm
