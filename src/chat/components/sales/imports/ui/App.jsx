import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'react-meteor-data';
import { Metrics } from '../api/metrics.js';
import Metric from './Metric.jsx';
import CSVDrop from './CSVDrop.jsx';
import _ from 'lodash';

// App component - represents the whole app
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      metrics: []
    }
  }

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
 
  getMetrics(metrics) {
    this.setState({metrics: metrics});
  }

  render() {
    let { metrics } = this.state;
    var displayMetrics = this.state.metrics.map((m)=>{ return (<Metric className='metric' key={m._id} metric={m} />)})
    return (
      <div className="wrapper">
        <div className="sidebar"> 
          <CSVDrop className="dropbox" getMetrics={this.getMetrics.bind(this)}/>
        </div>
        <div className="container">
          <header>
            <h1>Sales Metrics</h1>
            <form className="new-metric" onSubmit={this.handleSubmit.bind(this)} >
              <input
                type="text"
                ref="textInput"
                placeholder="Type to search metrics"
              />
            </form>
          </header>
          {displayMetrics}
        </div>
      </div>
    );
  }
}


App.propTypes = {
  // metrics: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  return {
    // metrics: Metrics.find({'metric':'cart.link.click'}, { sort: { createdAt: -1 }, limit: 10}).fetch(),
  };
}, App);