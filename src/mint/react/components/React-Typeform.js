/**
 * react-typeform
 * from https://github.com/mohithg/react-typeform
 * by mohithg
 */

import React from 'react';
import {Button} from 'react-bootstrap';

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
        opacity: 0.3,
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
  setClass(element, tfStyle, enabled) {
    return React.cloneElement(element, {
      tfStyle,
      enabled
    });
  }

  /**
   * Get the current component to show on screen
   */
  getCurrentView(children) {
    let allChildren;
    allChildren = React.Children.map(children, (child, index) => {
      let currentChild = this.setClass(child, this.styles.tfHide, false);
      if (index === this.state.current) {
        currentChild = this.setClass(child, this.styles.tfShow, true);
      }
      return currentChild;
    });
    allChildren.splice(this.state.current + 1, 0,
      this.isLastComponent()
        ? <Button key={this.state.current} type="submit" onClick={this.props.onSubmit} className={this.props.submitBtnClass}>
            {this.props.submitBtnText}
          </Button>
        : <Button key={this.state.current} onClick={this.incState} className={this.props.nextBtnClass}>
            {this.props.nextBtnText}
          </Button>);
    return allChildren;
  }

  /**
   * Increment State counter
   */
  incState() {
    if (this.props.children.length > this.state.current) {
      const current = this.state.current + 1;
      this.setState({
        current
      });
    }
    this.props.nextBtnOnClick();
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
      <div className="form-container">
        {this.getCurrentView(this.props.children)}
      </div>
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
