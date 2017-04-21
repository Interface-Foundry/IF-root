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
      currentQuery = gql`
        query GetStoreTeamById($team_id: String!){
          teams(team_id:$team_id){
            members{id,name,is_admin}, meta{all_channels}
          }
        }
      `;
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
          team_id: currentTeam.team_id,
        },
      },
    });
    const TableWithData = gqlWrapper(getCurrentTable);


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
          <TableWithData />
      </div>
    )
  }
 
}

  const getCurrentTable = ({ data }) => {
    var self = this;
    if (data.loading) {
      return <p> Loading... </p>
    }
    var team_members = data.teams[0].members;
    var team_channels = data.teams[0].meta.all_channels;
    return (
      <div>
      <div>Users: {team_members.length}</div>
      <div>Admins: {listTeamAdmins(team_members)}</div>
      <div>Channels: {listTeamChannels(team_channels)}</div>
      </div>
    )
  };

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
