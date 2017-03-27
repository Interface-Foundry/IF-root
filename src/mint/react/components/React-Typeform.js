/**
 * react-typeform
 * from https://github.com/mohithg/react-typeform
 * by mohithg
 */

import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

/**
 * Typeform component that renders each component of a form
 */
class typeForm extends React.Component {

  /**
   * constructor
   */
  constructor(props) {
    super(props);

    /**
     * Initial State
     */
    this.state = {
      current: 0
    };

    /**
     * Styles
     * fade fields instead of hiding
     */
    this.styles = {
      tfShow: {
        opacity: 1
      },
      tfHide: {
        opacity: 0.2,
        'pointerEvents': 'none'
      }
    };

    /**
     * Binding this to methods
     */
    this.incState = this.incState.bind(this);
    this.isLastComponent = this.isLastComponent.bind(this);
  }

  /**
   * Set className for component to show/hide
   */
  setClass(element, enabled, key) {
    return React.cloneElement(element, {
      enabled,
      key
    });
  }

  getButton(disabled, lastComponent, action) {
    let button = lastComponent ? <Button disabled={disabled} key={this.state.current} bsStyle='primary' onClick={this.props.onSubmit} className={this.props.submitBtnClass} type='submit'>
          Finish
        </Button> : <Button disabled={disabled} key={this.state.current} type='submit' onClick={this.incState} className={this.props.nextBtnClass}>
          {this.props.nextBtnText}
        </Button>
    return <InputGroup.Button>{button}</InputGroup.Button>
  }

  /**
   * Get the current component to show on screen
   */
  getCurrentView(children) {
    const { tfHide, tfShow } = this.styles;
    return React.Children.map(children, (child, index) => {
      const enabled = index === this.state.current
      let currentChild = this.setClass(child, enabled, index);
      return <InputGroup style={enabled ? tfShow : tfHide}>{currentChild}{this.getButton(!enabled, index === this.props.children.length-1, currentChild.action)}</InputGroup>;
    });
  }

  /**
   * Increment State counter
   */
  incState(e) {
    if (this.props.children.length > this.state.current) {
      const current = this.state.current + 1;
      this.setState({
        current
      });
    }
    this.props.nextBtnOnClick(e);
  }

  /**
   * Check if last component
   */
  isLastComponent() {
    return this.props.children.length - 1 === this.state.current;
  }

  /**
   * render the typeform
   */
  render() {
    return (
      <Form className="form-container">
        {this.getCurrentView(this.props.children)}
      </Form>
    );
  }
}

/**
 * Validating propTypes
 */
typeForm.propTypes = {
  children: React.PropTypes.arrayOf(React.PropTypes.element)
    .isRequired,
  onSubmit: React.PropTypes.func,
  submitBtnText: React.PropTypes.string,
  submitBtnClass: React.PropTypes.string,
  nextBtnText: React.PropTypes.string,
  nextBtnClass: React.PropTypes.string,
  nextBtnOnClick: React.PropTypes.func
};

/**
 * Default Props
 */
typeForm.defaultProps = {
  nextBtnOnClick: () => {},
  onSubmit: () => {},
  submitBtnText: 'Save',
  nextBtnText: 'Next'
};

/**
 * export the typeform component
 */
export default typeForm;
