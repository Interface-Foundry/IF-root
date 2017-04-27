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
      // <TableHeaderColumn dataField='team.team_name'>Team ID</TableHeaderColumn>

export { CafeTable, CartTable };
