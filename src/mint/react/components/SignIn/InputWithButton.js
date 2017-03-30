import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {
  render() {
    const { input, meta: { error }, submit } = this.props

    return (
      <div className={`custom__input${error?'-error':''}`}>
        {error?<em>{error}</em>:null}
        <input {...input} required className='custom__input__field' />
        {submit?
        	<button className="custom__input__button" onClick={submit}>Submit</button>:
        	<button className="custom__input__button" onClick={(e) => {
        		e.preventDefault()
        		e.target.blur()
        	}}>Submit</button>}
      </div>
    )
  }
}
