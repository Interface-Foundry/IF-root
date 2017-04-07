import React, { PropTypes, Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, ButtonToolbar, Alert
} from 'react-bootstrap';
import s from './Home.css';
import StatWidget from '../../components/Widget';
import Donut from '../../components/Donut';
import CartTable from '../../components/CartTable';
import DeliveryTable from '../../components/DeliveryTable';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import {
  Tooltip,
  XAxis, YAxis, Area,
  CartesianGrid, AreaChart, Bar, BarChart,
  ResponsiveContainer } from '../../vendor/recharts';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/
/*
const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400, value: 600 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 300 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000, value: 400 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181, value: 200 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500, value: 700 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100, value: 100 },
];
*/

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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      startDate: moment().subtract(1, 'month'),
      endDate: moment(),
    };
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.renderCartTable = this.renderCartTable.bind(this);
    this.renderDeliveryTable = this.renderDeliveryTable.bind(this);
    this.changeCart = this.changeCart.bind(this);
  }
  


  changeStart(date){
    this.setState({
      startDate: date
    });
  }

  changeEnd(date){
    this.setState({
      endDate: date
    });
  }

  changeCart(cart){
    this.setState({ 
      view: cart 
    })
  }

  renderCartTable(startDate, endDate){
    //console.log(new Date(startDate),new Date(endDate));
    //console.log(this.props);
    return (
      <Panel className='fillSpace' header={<span><i className="fa fa-bar-chart-o fa-fw" /> Purchased Store Carts from {new Date(startDate).toLocaleString()} to {new Date(endDate).toLocaleString()}</span>}>
      
        <CartTable 
                start = {startDate}
                end = {endDate}
                teams = {this.props.teams}
                heads = {
                  [{ 
                    field: 'created_date',
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
                    descrip: 'Cart Size'
                  }, 
                  {
                    field: 'category',
                    descrip: 'Category'
                  },
                  {
                    field: 'quantity',
                    descrip: 'Quantity'
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
                        if(cart.amazon && cart.amazon.CartItems){
                          var self = this;
                          if(new Date(cart.created_date)>=new Date(startDate) && new Date(cart.created_date)<=new Date(endDate)){
                            carts.push({
                              team_name: team.team_name,
                              purchased_date: cart.purchased_date ? (new Date(cart.purchased_date)).toLocaleString() : 'Not Available',
                              created_date: (new Date(cart.created_date)).toLocaleString(),
                              items: cart.amazon.CartItems[0].CartItem.reduce(function(a,b){
                                  return a+Number(b.Quantity);
                                },0),
                              cart_total: cart.amazon.SubTotal[0].FormattedPrice,
                            });
                            cart.amazon.CartItems[0].CartItem.map(function(item){
                              var cartItem = cart.amazon.CartItems ? cart.amazon.CartItems[0].CartItem.find(function(i){
                                  return i.ASIN==item.ASIN
                                }) : '';
                              carts.push({
                                category: cartItem ? cartItem.ProductGroup : '',
                                quantity: item.Quantity,
                                price: item.Price[0].FormattedPrice,
                                title: item.Title
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
      )

  }

  renderDeliveryTable(startDate, endDate){
    //console.log(new Date(startDate),new Date(endDate));
    return(
      <Panel className='fillSpace' header={<span><i className="fa fa-bar-chart-o fa-fw" /> Purchased Cafe Carts from {new Date(startDate).toLocaleString()} to {new Date(endDate).toLocaleString()}</span>}>
      
        <DeliveryTable 
                start = {startDate}
                end = {endDate}
                teams = {this.props.teams}
                heads = {
                  [{ 
                    field: 'created_date',
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
                    field:'restaurant',
                    descrip: 'Restaurant'
                  },
                  {
                    field:'cart_size',
                    descrip: 'Cart Size'
                  },
                  {
                    field: 'items',
                    descrip: 'Quantity'
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
                        var self = this;
                        var addedItems = delivery.cart.filter(function(item){
                              return item.added_to_cart==true
                            })
                        if(new Date(delivery.payment_post.time_started)>=new Date(startDate) && new Date(delivery.payment_post.time_started)<=new Date(endDate)){
                          deliveries.push({
                            team_name: team.team_name,
                            purchased_date: (new Date(delivery.order.order_time)).toLocaleString(),
                            created_date: (new Date(delivery.payment_post.time_started)).toLocaleString(),
                            restaurant: delivery.order.merchant_info.name,
                            cart_size: delivery.order.item_count,
                            cart_total: '$'+delivery.order.total.toFixed(2),
                            });
                            addedItems.map(function(item){
                                let addedItem = delivery.order.cart.find(function(i){
                                  return i.id == item.item.item_id || i.id.split('-').pop() == item.item.item_id
                                })
                                deliveries.push({
                                items: addedItem.quantity,
                                user: team.members.find(function(m){
                                  return m.id == item.user_id
                                }).name,
                                order: addedItem.name
                              })
                          })
                        }
                      }
                      return deliveries;
                    }, [])

                  )
                }
        /> 

    </Panel>
  )
  }

  render(){
    var self = this;
    return (
      <div>
        <div className="container-fluid data-display">
          <ButtonToolbar>
            <Button onClick={ ()=> self.changeCart('Store')}>
              Store
            </Button>
            <Button onClick={ ()=> self.changeCart('Cafe')}>
              Cafe
            </Button>
          </ButtonToolbar>
          <div>
              Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />    
              End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
          </div>
            { self.state.view=='Store' ? self.renderCartTable(self.state.startDate, self.state.endDate) : self.renderDeliveryTable(self.state.startDate, self.state.endDate) }

        </div>
      </div>

    )
  }
  
}

export default Home;
