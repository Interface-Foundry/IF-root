import React, { Component, PropTypes, Image } from 'react';


class Tabs extends Component {
   constructor(props, context) {
    super(props, context);
    this.state = {
      selected: this.props.selected
    };
  }
  handleClick(index, event) {
    event.preventDefault();
    this.setState({
      selected: index
    });
  };
  _renderTitles() {
    function labels(child, index) {
      let activeClass = (this.state.selected === index ? 'active' : '');
      return (
        <li key={index} style={{display: 'inline', marginRight: '1em'}}>
          <a href="#" 
            className={activeClass}
            onClick={this.handleClick.bind(this, index)} style={{color: 'white'}}>
            {child.props.label}
          </a>
        </li>
      );
    }
    return (
      <ul className="tabs__labels" style={{ color: 'white'}}>
        {this.props.children.map(labels.bind(this))}
      </ul>
    );
  };
  _renderContent() {
    return (
      <div className="tabs__content">
        {this.props.children[this.state.selected]}
      </div>
    );
  };
  render() {
    return (
      <div className="tabs">
        {this._renderTitles()}
        {this._renderContent()}
      </div>
    );
  }
};

export default Tabs