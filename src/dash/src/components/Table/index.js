import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ResponsiveContainer } from 'recharts';
import { Panel } from 'react-bootstrap';


function nameFormatter(cell, row, property) {
  return cell ? `<p>${cell[property]}</p>` : '';
}

const CafeTable = ({data, purchased}) => {
  let newData = [];
  for (var i = 0; i<data.length; i++){
    newData.push(data[i]);
    data[i].cart.map(function(item){
      if(data[i].order && item.added_to_cart == true){
        let user = data[i].team.members.find(function(m){
            return m.id == item.user_id
          }).name
        let matched_item = data[i].order.cart.find(function(i){
            return i.id == item.item.item_id
          })
        newData.push({
          user: user,
          item_name: matched_item.name,
          item_qty: item.item.item_qty
        })
      }

    })
  }

  const panelTitle = (<h3> {purchased ? 'purchased carts' : 'unpurchased carts'} for cafe </h3>)

  return (
    <Panel header={panelTitle}>
    <div className="resizable">
          <BootstrapTable data={newData} hover>
          <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
          <TableHeaderColumn dataField='team' dataFormat={nameFormatter} formatExtraData={'team_name'}>Group Name</TableHeaderColumn>
          <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
          <TableHeaderColumn dataField='item_count'>Total Item Count</TableHeaderColumn>
          <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
          <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
          <TableHeaderColumn dataField='user'>User</TableHeaderColumn>
          <TableHeaderColumn dataField='item_name'>Item</TableHeaderColumn>
          <TableHeaderColumn dataField='item_qty'>Item Qty</TableHeaderColumn>
        </BootstrapTable>
    </div>
    </Panel>
  );
};

//carts{created_date, team{team_name}, type, item_count, cart_total, items{title}}}
const CartTable = ({data, purchased}) => {
  let newData = [];
  for (var i = 0; i<data.length; i++){
    newData.push(data[i]);
    if(data[i].items.length > 0){
      data[i].items.map(function(item){
        newData.push({
           title: item.title,
           purchased: item.purchased
        })
      })
    }
  }
  const panelTitle = (<h3> {purchased ? 'purchased carts' : 'unpurchased carts'} for store </h3>)

  return (
    <Panel header={panelTitle}>
      <div className="table-display">

    <BootstrapTable data={newData} bordered={false} scrollTop={'Top'} hover>
      <TableHeaderColumn isKey={true} dataField='created_date'>Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={nameFormatter} formatExtraData={'team_name'}>Group Name</TableHeaderColumn>
      <TableHeaderColumn dataField='type' width='50px'>Type</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count' width='150px'>#Items</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total' width='100px'>Cart Total</TableHeaderColumn>
      <TableHeaderColumn dataField='title'>Product Name</TableHeaderColumn>
    </BootstrapTable>
    </div>
    </Panel>
  );
};

const MintTable = ({data, purchased}) => {
  
  const panelTitle = (<h3> {purchased ? 'purchased carts' : 'unpurchased carts'} for mint </h3>)

  return (
    <Panel header={panelTitle}>
      <div className="table-display">

    <BootstrapTable data={data} bordered={false} scrollTop={'Top'} hover>
      <TableHeaderColumn isKey={true} dataField='createdAt'>Date Added</TableHeaderColumn>
      <TableHeaderColumn dataField='cart'>Cart ID</TableHeaderColumn>
      <TableHeaderColumn dataField='added_by'>Added By</TableHeaderColumn>
      <TableHeaderColumn dataField='asin'>ASIN</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='name'>Product Name</TableHeaderColumn>
      <TableHeaderColumn dataField='price'>Price</TableHeaderColumn>
    </BootstrapTable>
    </div>
    </Panel>

  );
};

const SendgridTable = (data) => {
  let newData = [];
  for(var i = 0; i<data.data.length; i++){
    newData.push({
      date: data.data[i].date,
      blocks: data.data[i].stats[0].metrics.blocks,
      bounce_drops:data.data[i].stats[0].metrics.bounce_drops,
      bounces:data.data[i].stats[0].metrics.bounces,
      clicks:data.data[i].stats[0].metrics.clicks,
      deferred:data.data[i].stats[0].metrics.deferred,
      delivered:data.data[i].stats[0].metrics.delivered,
      invalid_emails:data.data[i].stats[0].metrics.invalid_emails,
      opens:data.data[i].stats[0].metrics.opens,
      processed:data.data[i].stats[0].metrics.processed,
      requests:data.data[i].stats[0].metrics.requests,
      spam_report_drops:data.data[i].stats[0].metrics.spam_report_drops,
      spam_reports:data.data[i].stats[0].metrics.spam_reports,
      unique_clicks:data.data[i].stats[0].metrics.unique_clicks,
      unique_opens:data.data[i].stats[0].metrics.unique_opens,
      unsubscribe_drops:data.data[i].stats[0].metrics.unsubscribe_drops,
      unsubscribes:data.data[i].stats[0].metrics.unsubscribes
    })
  }
  const panelTitle = (<h3>SendGrid Stats</h3>)
  return (
    <Panel header={panelTitle}>
      <div className="table-display">
        <BootstrapTable data={newData} bordered={false} scrollTop={'Top'} hover>
          <TableHeaderColumn isKey={true} dataField='date'>Date</TableHeaderColumn>
          <TableHeaderColumn dataField='blocks'>Blocks</TableHeaderColumn>
          <TableHeaderColumn dataField='bounce_drops'>Bounce Drops</TableHeaderColumn>
          <TableHeaderColumn dataField='bounces'>Bounces</TableHeaderColumn>
          <TableHeaderColumn dataField='clicks'>Clicks</TableHeaderColumn>
          <TableHeaderColumn dataField='deferred'>Deferred</TableHeaderColumn>
          <TableHeaderColumn dataField='delivered'>Delivered</TableHeaderColumn>
          <TableHeaderColumn dataField='invalid_emails'>Invalid Emails</TableHeaderColumn>
          <TableHeaderColumn dataField='opens'>Opens</TableHeaderColumn>
          <TableHeaderColumn dataField='processed'>Processed</TableHeaderColumn>
          <TableHeaderColumn dataField='requests'>Requests</TableHeaderColumn>
          <TableHeaderColumn dataField='spam_report_drops'>Spam Report Drops</TableHeaderColumn>
          <TableHeaderColumn dataField='spam_reports'>Spam Reports</TableHeaderColumn>
          <TableHeaderColumn dataField='unique_clicks'>Unique Clicks</TableHeaderColumn>
          <TableHeaderColumn dataField='unique_opens'>Unique Opens</TableHeaderColumn>
          <TableHeaderColumn dataField='unsubscribe_drops'>Unsubscribe Drops</TableHeaderColumn>
          <TableHeaderColumn dataField='unsubscribes'>Unsubscribes</TableHeaderColumn>
        </BootstrapTable>
      </div>
    </Panel>

  );
  
};

const SendgridTeamsTable = (data) => {
  let newData = [];
  for(var i = 0; i<data.data.length; i++){
    var entry = data.data[i]
    newData.push({
      groupId: entry.asm_group_id,
      email: entry.email,
      event: entry.event,
      event_id: entry.sg_event_id,
      message_id: entry.sg_message_id,
      timestamp: new Date(entry.timestamp*1000).toLocaleString(),
    })
  }
  const panelTitle = (<h3>SendGrid Group Stats</h3>)
  return (
    <Panel header={panelTitle}>
      <div className="table-display">
        <BootstrapTable data={newData} bordered={false} scrollTop={'Top'} hover>
          <TableHeaderColumn isKey={true} dataField='groupId'>Group ID</TableHeaderColumn>
          <TableHeaderColumn dataField='email'>Email</TableHeaderColumn>
          <TableHeaderColumn dataField='event'>Event</TableHeaderColumn>
          <TableHeaderColumn dataField='event_id'>Event ID</TableHeaderColumn>
          <TableHeaderColumn dataField='message_id'>Message ID</TableHeaderColumn>
          <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
        </BootstrapTable>
      </div>
    </Panel>

  );
};

export { CafeTable, CartTable, MintTable, SendgridTable, SendgridTeamsTable };
