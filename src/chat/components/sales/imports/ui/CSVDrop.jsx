import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import csv from 'csvtojson';
import _ from 'lodash';
import { Metrics } from '../api/metrics.js';

export default class CSVDrop extends Component {
    async onDrop (acceptedFiles, rejectedFiles) {
      console.log('Accepted files: ', acceptedFiles);
      if (acceptedFiles.length > 0) {
          acceptedFiles.forEach((file)=> {
           Papa.parse( file, {
              header: true,
              complete( data, file ) {
                console.log('results:', data);
                if(data.data.length > 1) {
                  data = data.data.slice(1, data.length);
                  data.map((datum) => {
                    let item = datum.__parsed_extra;
                    let metrics = Metrics.find({'metric':'cart.link.click', 'data.asin': _.get(item,'[0]')}).fetch();
                    console.log(' metrics in db', _.get(item,'[0]'), metrics, Metrics.find().count());                  
                  });
                } else {
                  console.log('data length:', data);
                };
                // Handle the upload here.
              }
            });
          });

       }
      console.log('Rejected files: ', rejectedFiles);
    }
    render() {
      return (
          <div>
            <Dropzone accept='text/csv' onDrop={this.onDrop}>
              <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
          </div>
      );
     }
};
