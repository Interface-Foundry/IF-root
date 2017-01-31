import React, { Component } from 'react';

/*
import d3 from "d3";
import moment from "moment";
*/

/*
import D3TimeAreaChart from "./charts/AreaChart.jsx";
import BarChart from "./charts/BarChart.jsx";
import DonutChart from "./charts/DonutChart.jsx";
import D3TimeLineChart from "./charts/LineChart.jsx";
import ProgressChart from "./charts/ProgressChart.jsx";
import StackChart from "./charts/StackChart.jsx";
import EventEmitter from "events";
import logo from './logo.svg';
*/

import Charts from './Charts';
import './App.css';


//var eventEmitter=new EventEmitter();

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Pokemon Gym 2</h2>
        </div>
        <p className="App-intro">
          Kip Cafe Analytics
        </p>
        <Charts />
      </div>

    );
  }
}

export default App;
