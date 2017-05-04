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
  let newData = [];
  for(var i = 0; i<data.length; i++){
    newData.push({
      date: data[i].date,
      blocks: data[i].stats[0].metrics.blocks,
      bounce_drops:data[i].stats[0].metrics.bounce_drops,
      bounces:data[i].stats[0].metrics.bounces,
      clicks:data[i].stats[0].metrics.clicks,
      deferred:data[i].stats[0].metrics.deferred,
      delivered:data[i].stats[0].metrics.delivered,
      invalid_emails:data[i].stats[0].metrics.invalid_emails,
      opens:data[i].stats[0].metrics.opens,
      processed:data[i].stats[0].metrics.processed,
      requests:data[i].stats[0].metrics.requests,
      spam_report_drops:data[i].stats[0].metrics.spam_report_drops,
      spam_reports:data[i].stats[0].metrics.spam_reports,
      unique_clicks:data[i].stats[0].metrics.unique_clicks,
      unique_opens:data[i].stats[0].metrics.unique_opens,
      unsubscribe_drops:data[i].stats[0].metrics.unsubscribe_drops,
      unsubscribes:data[i].stats[0].metrics.unsubscribes
    })
  }
  return (
    <Panel header={<span><i className="fa fa-line-chart " />SendGrid Statistics</span>}>
      <div className="resizable">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={newData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#000000" />
            <CartesianGrid stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" yAxisId="left" dataKey="price" stroke="#000000" fill="#000000" />
            <Line type="monotone" yAxisId="left" dataKey="blocks" stroke="#0000FF" fill="#0000FF" />
            <Line type="monotone" yAxisId="left" dataKey="bounce_drops" stroke="#00FFFF" fill="#00FFFF" />
            <Line type="monotone" yAxisId="left" dataKey="bounces" stroke="#FF0000" fill="#FF0000" />
            <Line type="monotone" yAxisId="left" dataKey="clicks" stroke="#FFFF00" fill="#FFFF00" />
            <Line type="monotone" yAxisId="left" dataKey="deferred" stroke="#FF8000" fill="#FF8000" />
            <Line type="monotone" yAxisId="left" dataKey="delivered" stroke="#FFBBFF" fill="#FFBBFF" />
            <Line type="monotone" yAxisId="left" dataKey="invalid_emails" stroke="#88FF88" fill="#88FF88" />
            <Line type="monotone" yAxisId="left" dataKey="opens" stroke="#00FF00" fill="#00FF00" />
            <Line type="monotone" yAxisId="left" dataKey="processed" stroke="#FF00FF" fill="#FF00FF" />
            <Line type="monotone" yAxisId="left" dataKey="requests" stroke="#888888" fill="#888888" />
            <Line type="monotone" yAxisId="left" dataKey="spam_report_drops" stroke="#888800" fill="#888800" />
            <Line type="monotone" yAxisId="left" dataKey="spam_reports" stroke="#880000" fill="#880000" />
            <Line type="monotone" yAxisId="left" dataKey="unique_clicks" stroke="#008888" fill="#008888" />
            <Line type="monotone" yAxisId="left" dataKey="unique_opens" stroke="#880088" fill="#880088" />
            <Line type="monotone" yAxisId="left" dataKey="unsubscribe_drops" stroke="#BBBBBB" fill="#BBBBB" />
            <Line type="monotone" yAxisId="left" dataKey="unsubscribes" stroke="#33BB33" fill="#33BB33" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
};

export { CartGraph, CafeGraph, MintGraph, SendGridGraph };
