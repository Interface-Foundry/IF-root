import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {

  componentWillReceiveProps(nextProps) {
    const { meta: { error, active, asyncValidating }, changeCenter, newAccount } = nextProps

    if (!active && !error && !asyncValidating && newAccount) {
      changeCenter('two')
    }
  }

  render() {
    const { input, meta: { error }, changeCenter, submit } = this.props

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
