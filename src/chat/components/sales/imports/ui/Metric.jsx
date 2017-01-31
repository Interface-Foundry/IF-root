import React, { Component, PropTypes } from 'react';
 
// Task component - represents a single todo item
export default class Metric extends Component {
	constructor(props) {
    super(props);
  }
  render() {
  	let m = this.props.metric;
    return (
      <li>{m.data.asins} : {m.data.thread} : {m.data.thread}: creation_date: {m.data.ts.toString()} : purchased_date: {m.data.purchased}, Category:  {m.data.category}, Quantity: {m.data.purchase_quantity} v. {JSON.stringify(m.data.items)}</li>
    );
  }
}
 
Metric.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  metric: PropTypes.object.isRequired,
};