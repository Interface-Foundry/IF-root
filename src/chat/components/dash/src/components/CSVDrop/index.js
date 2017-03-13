import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import csvparse from './csvparse'
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
      this.state = {files: ''};
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
    file.append('csv_file', acceptedFiles[0]);
  request.post('/upload')
    .send(file)
    .end(function(err, resp) {
      if (err) { console.error(err); }
      return resp;
    });

    //try{csvparse(acceptedFiles[0]);}catch(e){console.log(e)}

    this.setState({
        files: acceptedFiles
    });

    }

    render() {
      const {files} = this.state;
      const fname = files ? files[0].name : 'None';
      return (
          <div>
            <Dropzone multiple={false} accept='text/csv' onDrop={this.onDrop.bind(this)}>
              <div>Try dropping some files here, or click to select files to upload. </div>
            </Dropzone>
            {fname} uploaded.
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