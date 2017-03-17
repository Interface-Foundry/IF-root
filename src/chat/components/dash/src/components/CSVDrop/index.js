import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import {ButtonGroup, Button, Checkbox, Panel} from 'react-bootstrap';

//import csv from 'csvtojson';
import _ from 'lodash';
//import { Metrics } from '../api/metrics.js';
//import subMonths from 'date-fns/sub_months';
//import addMonths from 'date-fns/add_months';

var request = require('superagent');
var propz;
var csv = require("fast-csv");

class CSVDrop extends Component {

    constructor(props) {
      super(props)
      propz = props;
      this.state = {files: '', checkedRows:[]};
      this.onDrop = this.onDrop.bind(this);
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
      file.append('csv_file', acceptedFiles[0]);
      request.post('/upload')
        .send(file)
        .end(function(err, resp) {
          if (err) { 
            console.error(err); 
          }
          self.setState({
            files: acceptedFiles,
            data: resp.text
          });
        });
    }

    addToCheckedRows(checkedRow){
      var self = this;
      var {checkedRows} = self.state
      
      if(checkedRows){
        var rowIndex = checkedRows.findIndex(function(row){
          return (row.ASIN == checkedRow.ASIN && row.Date == checkedRow.Date)
        });
        console.log(rowIndex);
        if(rowIndex!=-1){
          checkedRows.splice(rowIndex,1);
          self.setState({checkedRows: checkedRows});
          console.log('Removing:', checkedRow.Name);
        } else {
          checkedRows.push(checkedRow);
          self.setState({checkedRows: checkedRows});
          console.log('Adding:', checkedRow.Name);
        }
      } else {
        console.log('None found.');
      }
    }

    render() {
      var self = this;
      const {files} = self.state;
      const fname = files ? files[0].name : 'None';
      const {data} = self.state;
      const dataText = data ? data : ''
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
                {dataText ? JSON.parse(dataText).map(row=>{
                  return <Checkbox key={row.ASIN+row.Date} onChange={() => self.addToCheckedRows(row)}>
                    <div>Item Name: {row.Name}</div>
                    <div>ASIN: {row.ASIN}</div>
                    <div>Date: {row.Date}</div>
                    </Checkbox>;
                }) : ''}
              </div>
              <div className="col-lg-6">
                <Button>Confirm</Button>
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