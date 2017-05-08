import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Panel, Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { graphql } from 'react-apollo';

import { SendGridGraph } from '../../../components/Graphs';
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
      ready:false,
      sg_data: '',
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
    return (<SendGridGraph data={stats} />);
  }

  generateEmailStats(startDate, endDate){
    var self = this;
    request.post('/sgquery')
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
    request.post('/sgdata')
    .send({filename: 'sg_log.txt'})
    .end(function(err, resp){
      if(err){
        console.error(err);
      }
      self.setState({
        sg_data: resp.text
      })
    })

  }

  listEmailStats(stats){
    return (<SendGridTable data={stats} />);
  }

  listGroupSendgridStats(){
    //return (<div>To be created.</div>)
    var stats = this.getSendgridEmails();
    return (<div>To be created.</div>);
  }

  getSendgridEmails(){
    var self = this;
    
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
          { self.state.ready == true ? self.graphEmailStats(sgStats) : 'Loading...'}
        </div>
        <div>
          Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />
          End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
        </div>
        <div>
          { self.state.ready == true ? self.listEmailStats(sgStats) : 'Loading...'}
        </div>
        <div>
          { self.state.ready == true ? self.listGroupSendgridStats() : 'Loading...'}
        </div>
      </div>
    )

  }
}

export default MintEmail;
