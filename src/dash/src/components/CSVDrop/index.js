import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import {ButtonGroup, Button, ButtonToolbar, Checkbox, Panel} from 'react-bootstrap';
import classNames from 'classnames';
import fetch from '../../core/fetch';
import co from 'co';
import * as mintdata from './mintdata'

//import csv from 'csvtojson';
import _ from 'lodash';
//import { Metrics } from '../api/metrics.js';
//import subMonths from 'date-fns/sub_months';
//import addMonths from 'date-fns/add_months';

import check_asin from './check_asin';

var request = require('superagent');
var propz;
var csv = require("fast-csv");

class CSVDrop extends Component {

    constructor(props) {
      super(props)
      propz = props;
      this.state = {
        view: 'Store',
        files: '', 
        checkedRows:[], 
        ready: false
      };
      this.onDrop = this.onDrop.bind(this);
      this.processCheckedRow = this.processCheckedRow.bind(this);
      this.processCheckedRows = this.processCheckedRows.bind(this);
    }
     
    componentDidMount() {
      var self = this;
      co(function * () {
        const resp = yield fetch('/graphql', {
            method: 'post',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: '{items(limit: 10000){_id,cart_id,title,image,description,price,ASIN,rating,review_count,added_by,slack_id,source_json,purchased,purchased_date,deleted,added_date,bundle,available,asins,config,}}',
            }),
            credentials: 'include',
          });
          const { data } = yield resp.json();
          if (!data || !data.items) throw new Error('Failed to load the items')
          else  {
            self.setState({
              items: data.items,
              mintitems: mintdata.items,
              ready: true
            })
          }
      })
    }

    changeState(value) {
      this.setState(value);

    }

    onDrop (acceptedFiles, rejectedFiles) {
      var file = new FormData();
      var self = this;
      const {view} = self.state;
      const {items} = self.state;
      const {mintitems} = self.state;
      file.append('csv_file', acceptedFiles[0]);
      request.post('/upload')
        .send(file)
        .end(function(err, resp) {
          if (err) { 
            console.error(err); 
          }
          //Put check_asin code here
          var matchedRows = check_asin(resp.text, items, mintitems, view)
          console.log(matchedRows)
          //var matchedRows = resp.text;
          self.setState({
            files: acceptedFiles,
            data: matchedRows
          });
        });
    }

    processCheckedRow(checkedRow){
      var self = this;
      const {items} = self.state;
      var matchedItem = items.find(function(i){return i._id == checkedRow._id})
      var query =  `mutation {setItemAsPurchased(itemId:"`+matchedItem._id+`"){ _id,cart_id,title,image,description,price,ASIN,rating,review_count,added_by,slack_id,source_json,purchased,purchased_date,deleted,added_date,bundle,available,asins,config}}`;
      co(function * () {
      const resp = yield fetch('/graphql', {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
          }),
          credentials: 'include',
        });
      const { data } = yield resp.json();
    })
    }
    

    processCheckedRows(checkedRows){
      //for each checked row, set the associated cart purchased = true
      var self = this;

      if(self.state.view == 'Store'){
        checkedRows.map((checkedRow) => self.processCheckedRow(checkedRow));
        alert("Items confirmed.")
        self.changeState({ data: [], files: '' })
      }
      
    }

    addToCheckedRows(checkedRow){
      var self = this;
      var {checkedRows} = self.state;
      var {view} = self.state;
      if(view == 'Store'){
        if(checkedRows){
          var rowIndex = checkedRows.findIndex(function(row){
            return (row.ASIN == checkedRow.ASIN && row.added_date == checkedRow.added_date)
          });
          if(rowIndex!=-1){
            checkedRows.splice(rowIndex,1);
            self.setState({checkedRows: checkedRows});
          } else {
            checkedRows.push(checkedRow);
            self.setState({checkedRows: checkedRows});
          }
        }
      } else {
        if(checkedRows){
          var rowIndex = checkedRows.findIndex(function(row){
            return (row.id == checkedRow.id)
          });
          if(rowIndex!=-1){
            checkedRows.splice(rowIndex,1);
            self.setState({checkedRows: checkedRows});
          } else {
            checkedRows.push(checkedRow);
            self.setState({checkedRows: checkedRows});
          }
        }
      }

    }

    render() {
      var self = this;
      const {files} = self.state;
      const fname = files ? files[0].name : 'No ' + self.state.view + ' CSV file';
      const {data} = self.state;
      const {view} = self.state;
      const dataText = data ? data : ''
      const {checkedRows} = self.state;
      return (
        <div>


          <div>
            <ButtonToolbar>
              <Button
                bsStyle={self.state.view.toLowerCase() === 'store' ? 'primary' : 'default'}
                onClick={()=> self.changeState({ view: 'Store', data: [], files: ''})}>
                Store
              </Button>
              <Button
                bsStyle={self.state.view.toLowerCase() === 'mint' ? 'primary' : 'default'}
                onClick={() => self.changeState({ view: 'Mint', data: [], files: ''})}>
                Mint
              </Button>
            </ButtonToolbar>
          </div>

          {this.state.ready == true ?
          <div>
            <Dropzone multiple={false} accept='text/csv' onDrop={this.onDrop}>
              <div>Try dropping some files here, or click to select files to upload. </div>
            </Dropzone>
              {fname} uploaded.
          </div> : 'Loading...'
          }
          <div>
              <div>
                { dataText.length>0 ? <Button onClick={() => self.processCheckedRows(checkedRows)}>Confirm</Button> : ''}
              </div>
              <div className="col-lg-8">
                <Panel header={"Item Matches"} >
                  {
                    view == 'Store' ? 
                    <div className="col-lg-6">
                      {dataText ? dataText.map(row=>{
                        return <Checkbox key={row[0]._id+row[0].ASIN+row[0].added_date+row[1].Date} onChange={() => self.addToCheckedRows(row[0])}>
                          <div>Item Name: {row[0].title.length > 30 ? row[0].title.substr(0,30)+'...' : row[0].title}</div>
                          <div>ASIN: {row[0].ASIN}</div>
                          <div>Date Added: {row[0].added_date}</div>
                          <div>Slack ID: {row[0].slack_id}</div>
                          <div>Added by: {row[0].added_by}</div>
                          <hr />
                          </Checkbox>;
                      }) : ''}
                    </div>
                  : 
                    <div className="col-lg-6">
                      {dataText ? dataText.map(row=>{
                        return <Checkbox key={row[0].id+row[0].cart+row[0].added_by} onChange={() => self.addToCheckedRows(row[0])}>
                          <div>Item Name: {row[0].name.length > 30 ? row[0].name.substr(0,30)+'...' : row[0].name}</div>
                          <div>ASIN: {row[0].asin}</div>
                          <div>Date Added: {row[0].createdAt}</div>
                          <div>Cart ID: {row[0].cart}</div>
                          <div>Added by: {row[0].added_by}</div>
                          <hr />
                          </Checkbox>;
                      }) : ''}
                    </div>
                  }


                  <div className="col-lg-6">
                    {dataText ? dataText.map(row=>{
                      return <Checkbox disabled={true}>
                        <div>Item Name: {row[1].Name.length > 30 ? row[1].Name.substr(0,30)+'...' : row[1].Name}</div>
                        <div>ASIN: {row[1].ASIN}</div>
                        <div>Date Added: {row[1].Date}</div>
                        <div>Category: {row[1].Category}</div>
                        <div>Quantity: {row[1].Qty}</div>
                        <hr />
                        </Checkbox>;
                    }) : ''}
                  </div>
                </Panel>

                
              </div>
          </div>


        </div>
      );
     }

};

export default CSVDrop;

/*
CSVDrop.propTypes = {
  getMetrics: PropTypes.func.isRequired
}
*/