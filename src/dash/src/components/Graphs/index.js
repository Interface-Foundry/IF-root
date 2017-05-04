import React from 'react';
import _ from 'lodash'
import {
  Tooltip, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line } from 'recharts';

import { Panel } from 'react-bootstrap';

/**
 * transform data to format for recharts graph
 * @param  {object} data - json of data from graphql
 * @param  {string} date_variable - date variable that is grouped on for graphs
 *                                  probably either 'created_date' or 'time_started'
 * @return {array} array that is plotable by recharts
 */
function transformToArray(data, dateVariable) {

  // group carts/deliveries by clean date since thats x axis key
  const groupedByDate = _.groupBy(data, dateVariable);

  // keys are using to iterate through json obj
  const dates = Object.keys(groupedByDate);

  return dates.map(d => {
    return groupedByDate[d].reduce((prev, curr) => {
      if (curr.items.length !== curr.item_count) {
        prev.item_count += curr.items.length;
      } else {
        prev.item_count += curr.item_count;
      }
      prev.cart_total = Number(curr.cart_total.replace(/[^0-9\.]+/g,""));
      prev.teams.push(_.get(curr, 'team.team_name'))
      return prev
    }, {
      date: d,
      item_count: 0,
      cart_total: 0,
      teams: []
    })
  })
}


const CafeGraph = ({data}) => {
  data = transformToArray(data, 'time_started');
  return (
    <Panel header={<span><i className="fa fa-line-chart " />Cafe Carts</span>}>
      <div className="resizable">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="item_count" stroke="#00FFFF" fill="#00FFFF" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
};


const CartGraph = ({data}) => {
  data = transformToArray(data, 'created_date');
  return (
    <Panel header={<span><i className="fa fa-line-chart " />Store Carts</span>}>
      <div className="resizable">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#00FFFF"/>
            <YAxis yAxisId="right" orientation="right" stroke="#ff8000"/>
            <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" yAxisId="left" dataKey="item_count" stroke="#00FFFF" fill="#00FFFF" />
          <Line type="monotone" yAxisId="right" dataKey="cart_total" stroke="#ff8000" fill="#ff8000" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
};

const MintGraph = ({data}) => {
  //data = transformToArray(data, 'createdAt');
  return (
    <Panel header={<span><i className="fa fa-line-chart " />Mint Carts</span>}>
      <div className="resizable">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <XAxis dataKey="createdAt" />
            <YAxis yAxisId="left" orientation="left" stroke="#00FFFF" />
            <CartesianGrid stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" yAxisId="left" dataKey="price" stroke="#00FFFF" fill="#00FFFF" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
};

const SendGridGraph = ({data}) => {
  //data = transformToArray(data, 'createdAt');
  return (
    <Panel header={<span><i className="fa fa-line-chart " />Mint Carts</span>}>
      <div className="resizable">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <XAxis dataKey="createdAt" />
            <YAxis yAxisId="left" orientation="left" stroke="#00FFFF" />
            <CartesianGrid stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" yAxisId="left" dataKey="price" stroke="#00FFFF" fill="#00FFFF" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
};

export { CartGraph, CafeGraph, MintGraph, SendGridGraph };
