import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'react-meteor-data';
import { Metrics } from '../api/metrics.js';
import Metric from './Metric.jsx';
import CSVDrop from './CSVDrop.jsx';

 
// App component - represents the whole app
class App extends Component {

  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    Metrics.insert({
      text,
      createdAt: new Date(), // current time
    });
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }
 
  renderMetrics() {
    return this.props.metrics.map((metric) => (
      <Metric key={metric._id} metric={metric} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Sales Metrics</h1>

          <form className="new-metric" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new metrics"
            />
          </form>

        </header>
 
        <ul>
          {this.renderMetrics()}
        </ul>

        <CSVDrop />
      </div>
    );
  }
}


App.propTypes = {
  metrics: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  return {
    metrics: Metrics.find({}, { sort: { createdAt: -1 }}).fetch(),
  };
}, App);