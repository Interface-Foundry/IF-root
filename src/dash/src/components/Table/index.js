import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

function nameFormatter(data, cell) {
  return cell ? `<p>${cell[data]}</p>` : '';
}

const CafeTable = ({data}) => {
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
  return (
    <BootstrapTable data={newData} hover>
      <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={ nameFormatter.bind(this, 'team_name') }>Team</TableHeaderColumn>
      <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Total Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
      <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
      <TableHeaderColumn dataField='user'>User</TableHeaderColumn>
      <TableHeaderColumn dataField='item_name'>Item</TableHeaderColumn>
      <TableHeaderColumn dataField='item_qty'>Item Qty</TableHeaderColumn>
    </BootstrapTable>
  );
};

//carts{created_date, team{team_name}, type, item_count, cart_total, items{title}}}
const CartTable = ({data}) => {
  let newData = [];
  for (var i = 0; i<data.length; i++){
    newData.push(data[i]);
    if(data[i].amazon && data[i].amazon.CartItems){
      data[i].amazon.CartItems[0].CartItem.map(function(item){
        newData.push({
           title: item.Title,
           category: item.ProductGroup
        })
      })
    }
  }
  return (
    <BootstrapTable data={newData} hover>
      <TableHeaderColumn isKey={true} dataField='created_date'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={ nameFormatter.bind(this, 'team_name') }>Team</TableHeaderColumn>
      <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Total Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
      <TableHeaderColumn dataField='category'>Category</TableHeaderColumn>
      <TableHeaderColumn dataField='title'>Item Name</TableHeaderColumn>
    </BootstrapTable>
  );
};
      // <TableHeaderColumn dataField='team.team_name'>Team ID</TableHeaderColumn>

export { CafeTable, CartTable };
