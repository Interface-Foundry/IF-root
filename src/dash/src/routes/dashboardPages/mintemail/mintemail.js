import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Panel, Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { graphql } from 'react-apollo';

//import { SendGridGraph } from '../../../components/Graphs';
import { SendGridTable } from '../../../components/Table';
import { cartsQuery, deliveryQuery } from '../../../graphqlOperations';
import * as mintdata from '../../../data/mintdata';


var request = require('superagent');

class MintEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      purchased: true,
      startDate: moment().subtract(6, 'month'),
      endDate: moment(),
      emailStats: '',
      ready:false
    };
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.changeState = this.changeState.bind(this);
  }


  // these could all be refactored into one vvv
  changeStart(date){
    this.setState({
      startDate: date,
      ready:false
    });
  }

  changeEnd(date){
    this.setState({
      ready:false,
      endDate: date
    });
  }

  changeState(value) {
    this.setState(value);
  }

  graphEmailStats(stats){
    return ('placeholder for graph email stats here');
  }

  generateEmailStats(startDate, endDate){
    var self = this;
    request.post('/sg')
    .send({ startDate: startDate.format("YYYY-MM-DD"), endDate: endDate.format("YYYY-MM-DD") })
    .end(function(err, resp) {
          if (err) { 
            console.error(err); 
          }
          self.setState({
              ready: true,
              emailStats: resp.text
            })
        });
  }

  listEmailStats(stats){
    return stats ? (<SendGridTable data={stats} />) : '';
  }

  render(){
    const self = this;
    let sgStats = '';
    if(self.state.ready == false){
      self.generateEmailStats(self.state.startDate, self.state.endDate);
    }
    sgStats = self.state.emailStats;
    sgStats = sgStats ? JSON.parse(sgStats) : '';


    return (
      <div>
        <div>
          { self.graphEmailStats(sgStats) }
        </div>
        <div>
          Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />
          End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
        </div>
        <div>
          { self.state.ready == true ? self.listEmailStats(sgStats) : 'Loading...'}
        </div>
    </div>
    )

  }
}

export default MintEmail;
