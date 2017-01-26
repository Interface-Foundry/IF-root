import React, { Component } from 'react';
import d3 from "d3";
import moment from "moment";

import D3TimeAreaChart from "./charts/AreaChart.jsx";
import BarChart from "./charts/BarChart.jsx";
import DonutChart from "./charts/DonutChart.jsx";
import D3TimeLineChart from "./charts/LineChart.jsx";
import ProgressChart from "./charts/ProgressChart.jsx";
import StackChart from "./charts/StackChart.jsx";
import eventEmitter from "events";
import logo from './kip.png';

class Charts extends Component {
  render() {
    return (
        <MainContainer />
    );
  }
}

class MainContainer extends Component{
  getData(){
    var data = [{key: 'a', value: 4},{key: 'b', value: 6},{key: 'c', value: 10},{key:'d',value:16}]
    return data
  };

/*
  render(){
    return (
      <div className="Chart">
      <div className="Chart-header">
          <h2>Chart shown here</h2>
        </div>
        <p className="Chart-intro">
          Put charts here. 
          {this.getData().map(station => (
            <div className="station" key={station.key}>{station.key} -> {station.value}</div>
          ))}
        </p>
      </div>
    );
  }
*/
  render(){
    return (
      <div className="MainContainer">
        <div className="Row">
	        <div className="Graph" >
		  <img className="App-logo" src={logo} /> 
                  {this.getData()[0].key} -> {this.getData()[0].value}
	        </div>
	        <div className="Graph" >
		  <img className="App-logo" src={logo} /> 
                  {this.getData()[1].key} -> {this.getData()[1].value}
	        </div>
        </div>
        <div className="Row">
	        <div className="Graph" >
		 <img className="App-logo" src={logo} /> 
                 {this.getData()[2].key} -> {this.getData()[2].value}
	        </div>
	        <div className="Graph" >
		 <img className="App-logo" src={logo} /> 
                 {this.getData()[3].key} -> {this.getData()[3].value}
	        </div>
        </div>
      </div>
    );
  }
}


export default Charts;
