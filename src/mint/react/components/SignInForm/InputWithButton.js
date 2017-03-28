import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {

	componentWillReceiveProps(nextProps) {
		const { meta: { error }, changeCenter } = nextProps

		if(error)
			changeCenter('two')
	}

  render() {
    const { input, meta: { error }, changeCenter, submit } = this.props

    return (
      <div className="custom__input row">
        <input {...input} className="custom__input__field" />
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