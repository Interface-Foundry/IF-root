import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, Alert
} from 'react-bootstrap';
import s from './Home.css';
import StatWidget from '../../components/Widget';
import Donut from '../../components/Donut';
import CartTable from '../../components/CartTable';
import DeliveryTable from '../../components/DeliveryTable';

import {
  Tooltip,
  XAxis, YAxis, Area,
  CartesianGrid, AreaChart, Bar, BarChart,
  ResponsiveContainer } from '../../vendor/recharts';

const title = 'Pokemon Gym - Escape Velocity';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/
const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400, value: 600 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 300 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000, value: 400 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181, value: 200 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500, value: 700 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100, value: 100 },
];

/* *********************************************** */

/*
<Panel
  header={<span>
    <i className="fa fa-bar-chart-o fa-fw" /> Purchased Carts
  </span>}>
    <div className="resizable">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
</Panel>
*/

function Home(props, context) {
  context.setTitle(title);
  return (
    <div className="container-fluid data-display">
      <Panel className='fillSpace' header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Purchased Store Carts </span>}>
      	<CartTable 
          query={'{teams(limit:5000){team_name, carts {created_date, purchased_date,items {_id,title,image,price,ASIN,added_by,source_json},purchased}}}'}
          heads = {
            [{ field: 'created_date',
               descrip: 'Created Date',
               allowSort: true,
               sort: (a, b, order) => order == 'desc' ? 
                  new Date(b.created_date) - new Date(a.created_date) 
                  : new Date(a.created_date) - new Date(b.created_date)
            },
            {
              field: 'purchased_date',
              descrip: 'Purchased Date',
              allowSort: true,
              sort: (a, b, order) => order == 'desc' ? 
                  new Date(b.purchased_date) - new Date(a.purchased_date) 
                  : new Date(a.purchased_date) - new Date(b.purchased_date)
            }, 
            {
              field: 'team_name',
              descrip: 'Slack ID'
            }, 
            {
              field:'cart_total',
              descrip: 'Cart Total'
            }, 
            {
              field: 'items',
              descrip: 'Number of Items'
            },
            {
              field: 'price',
              descrip: 'Item Price'
            },
            {
              field: 'title',
              descrip: 'Product Name'
            }]
          }
          process = {
            (teams, team) => 
            teams.concat(
              team.carts.reduce((carts, cart) => {
                if(cart.purchased){
                  if (cart.purchased == true) {
                      carts.push({
                      team_name: team.team_name,
                      purchased_date: (new Date(cart.purchased_date)).toLocaleString(),
                      created_date: (new Date(cart.created_date)).toLocaleString(),
                      items: cart.items.length,
                      cart_total: '$'+cart.items.reduce(function(a,b){
                        return (a+Number(b.price.replace(/[^0-9\.]+/g,"")));
                      },0).toFixed(2),
                      });
                      cart.items.map(function(item){
                        carts.push({
                          price: item.price,
                          title: item.title
                        })
                      })
                  }
                }
                return carts;
              }, [])

            )
          }
        />
      </Panel>

      <Panel className='fillSpace' header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Purchased Cafe Carts </span>}>
        <DeliveryTable 
          query={'{teams(limit:5000){members{id,name},team_name, deliveries{order, cart, payment_post}}}'}
          heads = {
            [{ field: 'created_date',
               descrip: 'Created Date',
               allowSort: true,
               sort: (a, b, order) => order == 'desc' ? 
                  new Date(b.created_date) - new Date(a.created_date) 
                  : new Date(a.created_date) - new Date(b.created_date)
            },
            {
              field: 'purchased_date',
              descrip: 'Purchased Date',
              allowSort: true,
              sort: (a, b, order) => order == 'desc' ? 
                  new Date(b.purchased_date) - new Date(a.purchased_date) 
                  : new Date(a.purchased_date) - new Date(b.purchased_date)
            }, 
            {
              field: 'team_name',
              descrip: 'Slack ID'
            }, 
            {
              field:'cart_total',
              descrip: 'Cart Total'
            }, 
            {
              field: 'items',
              descrip: 'Number of Items'
            },
            {
              field: 'user',
              descrip: 'User ID'
            },
            {
              field: 'order',
              descrip: 'Order'
            }]
          }
          process = {
            (teams, team) => 
            teams.concat(
              team.deliveries.reduce((deliveries, delivery) => {
                if(delivery.payment_post){
                      deliveries.push({
                      team_name: team.team_name,
                      purchased_date: (new Date(delivery.order.order_time)).toLocaleString(),
                      created_date: (new Date(delivery.payment_post.time_started)).toLocaleString(),
                      items: delivery.cart.length,
                      cart_total: delivery.order.total,
                      });
                      delivery.cart.map(function(item){
                        if(item.added_to_cart==true){
                          deliveries.push({
                          user: team.members.find(function(m){
                            return m.id == item.user_id
                          }).name,
                          order: delivery.order.cart.find(function(i){
                            return i.id == item.item.item_id || i.id.split('-').pop() == item.item.item_id
                          }).name
                        })
                        }
                        
                      })
                }
                return deliveries;
              }, [])

            )
          }
        />
      </Panel>

    </div>
  );
}

Home.propTypes = {

};

Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Home);
