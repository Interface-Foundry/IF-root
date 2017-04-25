import React, { PropTypes ,Component} from 'react';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import {
  LineChart, Sector, Cell, Tooltip, PieChart, Pie,
  Line, XAxis, YAxis, Legend,
  CartesianGrid, Bar, BarChart,
  ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  MenuItem, Panel,
  DropdownButton, Button, ButtonToolbar,
  ListGroup, ListGroupItem, Alert, Popover, OverlayTrigger
} from 'react-bootstrap';
import { gql, graphql } from 'react-apollo';
import DatePicker from 'react-datepicker';
import Table from '../../../components/Table/common';
import vagueTime from 'vague-time';
import moment from 'moment';
import _ from 'lodash';
import { teamCartsQuery } from '../../../graphqlOperations';

const title = ' Team Stats';


const COLORS = ['#FF0000', '#FF8888', '#0000FF', '#8888FF'];


function sumStoreTeamOrders(teams){
  	var total = 0;
  	for(var i = 0; i<teams.length; i++){
  		total += teams[i].carts.length;
  	}
  	return total;
  }

function sumStoreTeamItems(teams){
  var totalItems = 0;
  for(var i = 0; i<teams.length; i++){
      for (var j = 0; j<teams[i].carts.length; j++){
        totalItems += teams[i].carts[j].items ? teams[i].carts[j].items.length : 0;
      }
  }
  return totalItems;
}

function sumCafeTeamOrders(teams){
  var total = 0;
  for(var i = 0; i<teams.length; i++){
    total += teams[i].deliveries.length;
  }
  return total;
}


function sumCafeTeamItems(teams){
  var totalItems = 0;
  for(var i = 0; i<teams.length; i++){
      for (var j = 0; j<teams[i].deliveries.length; j++){
        totalItems += teams[i].deliveries[j].cart ? teams[i].deliveries[j].cart.length : 0;
      }
  }
  return totalItems;
}


function getPieChartTeamStatsData(teams, teamId){ // [store item count, store order count, cafe item count, cafe order count]
  const data = [];
  var foundTeam = teamId ? teams.filter(function(t){return t.team_id==teamId}) : null;
  var numStoreItems = teamId ? sumStoreTeamItems(foundTeam) : sumStoreTeamItems(teams);
  var numStoreOrders = teamId ? foundTeam[0].carts.length : sumStoreTeamOrders(teams);
  var numCafeItems = teamId ? sumCafeTeamItems(foundTeam) : sumCafeTeamItems(teams);
  var numCafeOrders = teamId ? foundTeam[0].deliveries.length : sumCafeTeamOrders(teams);
  data.push({name: '# Store Items', value: numStoreItems})
  data.push({name: '# Store Orders', value: numStoreOrders})
  data.push({name: '# Cafe Items', value: numCafeItems})

  data.push({name: '# Cafe Orders', value: numCafeOrders})
  return data;
}


class displayTeamStats extends Component {
  constructor(props){
    super(props);
    this.state = {
      view: 'Store',
      team_id: '',
      startDate: moment().subtract(1, 'month'),
      endDate: moment(),
    };
    this.changeCart = this.changeCart.bind(this);
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
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

  getCurrentQuery() {
    let currentQuery;
    if (this.state.view === 'Cafe') {
      currentQuery = gql`
        query GetCafeTeamById($team_id: String!){
          teams(team_id:$team_id){
            members{id,name,is_admin}, meta{all_channels}
          }
        }
      `;
    } else if (this.state.view === 'Store') {
      //store query
      currentQuery = teamCartsQuery 
    }
    return currentQuery;
  }
  
  render(){
    var self = this;
    var teams = self.props.teams;
    var currentTeam = teams[0];

    const currentQuery = this.getCurrentQuery();
    const gqlWrapper = graphql(currentQuery, {
      options: {
        variables: {
          team_id: "T02PN3B25", //currentTeam.team_id,
        },
      },
    });
    const ViewWithData = gqlWrapper(getCurrentData);


    return (
      <div>
        Viewing {self.state.view} stats of {currentTeam.team_name}
        <ButtonToolbar>
            <Button bsStyle={self.state.view=='Store' ? "primary" : "default"} onClick={ ()=> self.changeCart('Store')}>
              Store
            </Button>
            <Button bsStyle={self.state.view=='Cafe' ? "primary" : "default"} onClick={ ()=> self.changeCart('Cafe')}>
              Cafe
            </Button>
          </ButtonToolbar>
          <div>
              Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />
              End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
          </div>
          <ViewWithData />
      </div>
    )
  }
 
}

  const getCurrentData = ({ data }) => {
    if (data.loading) {
      return <p> Loading... </p>
    }
    var team_members = data.teams[0].members;
    var team_channels = data.teams[0].meta.all_channels;

    if(data.teams[0].carts){
      var team_carts = data.teams[0].carts;
    } else if(data.teams[0].deliveries){
      var team_deliveries = data.teams[0].deliveries;
    }

    return (
      <div>
      <div><h2>Users:</h2> {team_members.length}</div>
      <div><h2>Admins:</h2> {listTeamAdmins(team_members)}</div>
      <div><h2>Channels:</h2> {listTeamChannels(team_channels)}</div>
      <div><h2>Carts:</h2> {data.teams[0].carts ? listCarts(team_carts) : listDeliveries(team_deliveries)}</div>
      </div>
    )
  };

  function listCarts(team_carts){
    return team_carts.map(function(cart) {
      var num_items = cart.item_count;
      if(cart.items && cart.item_count !== cart.items.length){
        num_items = cart.items.length;
      } 
      return (<div>
        <div><b>Created:</b> {cart.created_date}</div>
        <div><b>Total:</b> {cart.cart_total}</div>
        <div><b>Items:</b> {num_items}</div>
        <div>{listCartItems(cart.items)}</div>
        </div>
      )

    })

  }

  function listCartItems(items){
    return items.map(function(item){
      return(<div>
        <div>&ensp; Title: {item.title}</div>
        <div>&ensp; Price: {item.price}</div>
        <div>&ensp; Added by: {item.added_by}</div>
        <div>&ensp; Purchased: {item.purchased.toString()}</div>
      </div>
      )
    })
  }

  function listDeliveries(team_deliveries){
    return 'Deliveries totals displayed here'
    /*
    return team_deliveries.map(function(deliveries) {
      return <div>{deliveries.time_started}</div>
    })
    */
  }

  function listTeamAdmins(teamMembers){
    var memberList = teamMembers.reduce((list, member) => {
      return list + " @" + member.name;
    }, '')
    return memberList;
  }

  function listTeamChannels(teamChannels){
    var channelList = teamChannels.reduce((list,channel) => {
      return list + " #" + channel.name;
    },'')
    return channelList;
  }

export default displayTeamStats;
