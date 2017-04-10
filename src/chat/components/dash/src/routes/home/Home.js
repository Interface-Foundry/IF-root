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
  ResponsiveContainer, LineChart, Line } from '../../vendor/recharts';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/

// const data = [
//   { name: 'Page A', uv: 4000, pv: 2400, amt: 2400, value: 600 },
//   { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 300 },
//   { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
//   { name: 'Page D', uv: 2780, pv: 3908, amt: 2000, value: 400 },
//   { name: 'Page E', uv: 1890, pv: 4800, amt: 2181, value: 200 },
//   { name: 'Page F', uv: 2390, pv: 3800, amt: 2500, value: 700 },
//   { name: 'Page G', uv: 3490, pv: 4300, amt: 2100, value: 100 },
// ];


/* *********************************************** */





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
      <Panel className='fillSpace' header={<span><i className="fa fa-fw"/> Purchased Store Carts from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>}>
      
        <CartTable 
                start = {startDate}
                end = {endDate}
                data = {this.props.data}
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

      <Panel header={<span><i className="fa fa-table fa-fw" /> Purchased Cafe Carts from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>}>
      
        <DeliveryTable 
                start = {startDate}
                end = {endDate}
                data = {this.props.data}
                heads = {
                  [{ 
                    field: 'created_date',
                    descrip: 'Created Date',
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
                    field: 'user',
                    descrip: 'User ID'
                  },
                  {
                    field: 'order',
                    descrip: 'Order'
                  }]
                }
                process = {
                  (deliveries, delivery) => {
                        var self = this;
                        if(new Date(delivery.time_started)>=new Date(startDate) && new Date(delivery.time_started)<=new Date(endDate)){
                          deliveries.push({
                            team_name: delivery.team_id,
                            created_date: (new Date(delivery.time_started)).toLocaleString(),
                            restaurant: delivery.chosen_restaurant,
                            cart_size: delivery.item_count,
                            cart_total: delivery.cart_total,
                            });
                            delivery.items.map(function(item){
                                deliveries.push({
                                user: item.user,
                                order: item.item_name
                              })
                          })
                        }
                      
                      return deliveries;
                    }

                  
                }
        /> 

    </Panel>
  )
  }

  renderCartsLineGraph(data){
    var dataPlot = [];   //name:time_range #carts, #teams, and #items
    var weekRanges=[]; 
    //console.log(data.data.deliveries);
    
    for(var i = 0; i<10; i++){
      weekRanges.push({index: i, startDate: new Date(moment().subtract(10-i, 'week')),endDate: new Date(moment().subtract(9-i, 'week')), numCarts:0,teams:[],numItems:0});
    }
    data.data.deliveries.map(function(delivery){
      var week = weekRanges.find(function(w){
        return new Date(delivery.time_started) > new Date(w.startDate) && new Date(delivery.time_started) <= new Date(w.endDate);
      });
      week.numCarts++;
      week.numItems += delivery.item_count;
      if(week.teams.length<1 || !week.teams.includes(delivery.team_id)) {
        week.teams.push(delivery.team_id);
      }
      
    })

    for(var i=0;i<10;i++){
      var currentWeek = weekRanges.find((x) => x.index==i);
      dataPlot.push({name: currentWeek.endDate.toLocaleDateString(), numCarts: currentWeek.numCarts, numItems: currentWeek.numItems, numTeams: currentWeek.teams.length})
    }
    
    return(
      <Panel
        header={<span><i className="fa fa-line-chart " />Purchased Carts</span>}>
          <div className="resizable">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPlot} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid stroke="#ccc" />
                <Tooltip />
                    <Line type="monotone" dataKey="numCarts" stroke="#8884d8" fill="#8884d8" />
                    <Line type="monotone" dataKey="numItems" stroke="#82ca9d" fill="#82ca9d" />
                    <Line type="monotone" dataKey="numTeams" stroke="#ffc658" fill="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </Panel>
    )
  }

  render(){
    var self = this;
    return (
      <div>
        <div>
            {self.renderCartsLineGraph(this.props.data)}
        </div>
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
          <div className="panel panel-default">
            { self.renderDeliveryTable(self.state.startDate, self.state.endDate) }
          </div>
        </div>
      </div>

    )
  }

  /*
  render(){
    var self = this;
    return (
      <div>
        <div>
            {self.renderCartsLineGraph(this.props.data)}
        </div>
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
            <div className="panel panel-default">
              { self.state.view=='Store' ? self.renderCartTable(self.state.startDate, self.state.endDate) : self.renderDeliveryTable(self.state.startDate, self.state.endDate) }
            </div>
        </div>
      </div>

    )
  }
  */
  
}

export default Home;
