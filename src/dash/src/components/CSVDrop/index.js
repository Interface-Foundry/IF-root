import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import {ButtonGroup, Button, Checkbox, Panel} from 'react-bootstrap';
import classNames from 'classnames';
import fetch from '../../core/fetch';
import co from 'co';

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
      this.state = {files: '', checkedRows:[]};
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
          self.setState({items: data.items})
        }
    })
  }
  // 0:"Sports & Outdoors"
  // 1:"Fallout Vault Tec Pip Boy PipBoy Cosplay Morale PS4 XBOX PVC Rubber 3D Velcro Patch"
  // 2:"B01B9KUGGM"
  // 3:"2016-10-07 17:15:19"
  // 4:"1"
  // 5:"8.95"
  // 6:"PA-API"
  // 7:"eileenog-20"
  // 8:"ndi"
  // 9:"DESKTOP"

    onDrop (acceptedFiles, rejectedFiles) {
      var file = new FormData();
      var self = this;
      const {items} = self.state;
      file.append('csv_file', acceptedFiles[0]);
      request.post('/upload')
        .send(file)
        .end(function(err, resp) {
          if (err) { 
            console.error(err); 
          }
          //Put check_asin code here
          var matchedRows = check_asin(resp.text, items)
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
      console.log(data);
    })
    }
    

    processCheckedRows(checkedRows){
      //for each checked row, set the associated cart purchased = true
      //console.log(checkedRows);
      var self = this;
      checkedRows.map((checkedRow) => self.processCheckedRow(checkedRow));
    }

    addToCheckedRows(checkedRow){
      var self = this;
      var {checkedRows} = self.state;
      
      if(checkedRows){
        var rowIndex = checkedRows.findIndex(function(row){
          return (row.ASIN == checkedRow.ASIN && row.added_date == checkedRow.added_date)
        });
        console.log(rowIndex);
        if(rowIndex!=-1){
          checkedRows.splice(rowIndex,1);
          self.setState({checkedRows: checkedRows});
          console.log('Removing:', checkedRow.title);
        } else {
          checkedRows.push(checkedRow);
          self.setState({checkedRows: checkedRows});
          console.log('Adding:', checkedRow.title);
        }
      }
    }

    render() {
      var self = this;
      const {files} = self.state;
      const fname = files ? files[0].name : 'No CSV file';
      const {data} = self.state;
      const dataText = data ? data : ''
      const {checkedRows} = self.state;
      return (
        <div>
          <div>
            <Dropzone multiple={false} accept='text/csv' onDrop={this.onDrop}>
              <div>Try dropping some files here, or click to select files to upload. </div>
            </Dropzone>
            {fname} uploaded.
          </div>
          <div className="col-lg-6">
            <Panel>
              <div>
                {dataText ? dataText.map(row=>{
                  return <Checkbox key={row.ASIN+row.added_date} onChange={() => self.addToCheckedRows(row)}>
                    <div>Item Name: {row.title}</div>
                    <div>ASIN: {row.ASIN}</div>
                    <div>Date Added: {row.added_date}</div>
                    </Checkbox>;
                }) : ''}
              </div>
              <div>
                { dataText ? <Button onClick={() => self.processCheckedRows(checkedRows)}>Confirm</Button> : ''}
              </div>
            </Panel>
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