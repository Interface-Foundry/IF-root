import React, { Component, PropTypes } from 'react';
 
// Task component - represents a single todo item
export default class Metric extends Component {
  render() {
    return (
      <li>{this.props.metric.text}</li>
    );
  }
}
 
Metric.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  metric: PropTypes.object.isRequired,
};