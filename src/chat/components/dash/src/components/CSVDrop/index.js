import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import csv from 'csvtojson';
import _ from 'lodash';
import { Metrics } from '../api/metrics.js';
import subMonths from 'date-fns/sub_months';
import addMonths from 'date-fns/add_months';

var propz;

export default class CSVDrop extends Component {

    constructor(props) {
      super(props)
      propz = props;
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
      var results = [];
      var count = 0;
      if (acceptedFiles.length > 0) {
          acceptedFiles.forEach((file)=> {
           Papa.parse( file, {
              header: false,
              complete( data, file ) {
                  if(data.data.length > 1) {
                    data = data.data;
                    data.map((item) => {
                      count++;
                      console.log(count);
                      if (item[1]) {
                        let iasin = _.get(item,'[2]')
                        // console.log('item: ', item[1]);
                        let purchaseDate = new Date(_.get(item,'[3]'));
                        let allowance = new Date(addMonths(purchaseDate, 3));
                        // console.log('iasin',iasin)
                        let clm = Metrics.find({"metric":"cart.link.click",  "data.asins": iasin }).fetch();
                        if (clm && clm.length > 0) {
                          console.log('found!', iasin)
                          clm.map( (m) => {
                             // && (purchaseDate < allowance)
                            if ((purchaseDate > m.data.ts )) {
                              m.data.category = _.get(item,'[0]');
                              m.data.purchased = _.get(item,'[3]');
                              m.data.purchase_quantity = _.get(item,'[4]');
                              m.data.price = _.get(item,'[5]');
                              m.data.device =  _.get(item,'[9]');
                              m.data.type = 'cart-link';
                              var updated = Metrics.update({'_id': m._id},m);
                              console.log('updated1: ', updated);
                              results.push(m);
                            }
                          })
                         }
                         let ilm = Metrics.find({'metric':'item.link.click',  "data.asins": iasin }).fetch();
                         if (ilm && ilm.length > 0) {
                          ilm.map( (m) => {
                             // && (purchaseDate < allowance)
                            if ((purchaseDate > m.data.ts )) {
                              m.data.category = _.get(item,'[0]');
                              m.data.purchased = _.get(item,'[3]');
                              m.data.purchase_quantity = _.get(item,'[4]');
                              m.data.price = _.get(item,'[5]');
                              m.data.device =  _.get(item,'[9]');
                              m.data.type = 'item-link';
                              var updated = Metrics.update({'_id': m._id},m);
                              console.log('updated2: ', updated)
                              results.push(m);
                            }
                          })
                         }
                        }
                      })
                    console.log('total updated: ', results);
                    propz.getMetrics(results);   
                  } else {
                    console.log('data length:', data);
                  };
              }
            });
          });
       } else{
          console.log('Rejected files: ', rejectedFiles);
       }
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

CSVDrop.propTypes = {
  getMetrics: PropTypes.func.isRequired
}