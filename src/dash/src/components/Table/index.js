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
      if(item.added_to_cart == true){
        newData.push({
          user: item.user_id,
          item_id: item.item.item_id
        })
      }

    })
  }
  return (
    <BootstrapTable data={newData} hover>
      <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team_id'>Team ID</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={ nameFormatter.bind(this, 'team_name') }>Team</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
      <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
      <TableHeaderColumn dataField='user'>User</TableHeaderColumn>
      <TableHeaderColumn dataField='item_id'>Item</TableHeaderColumn>
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
        })
      })
    }
  }


  return (
    <BootstrapTable data={newData} hover>
      <TableHeaderColumn isKey={true} dataField='created_date'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={ nameFormatter.bind(this, 'team_name') }>Team</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
      <TableHeaderColumn dataField='title'>Item Name</TableHeaderColumn>
    </BootstrapTable>
  );
};
      // <TableHeaderColumn dataField='team.team_name'>Team ID</TableHeaderColumn>

export { CafeTable, CartTable };
