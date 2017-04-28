import React, { PropTypes, Component } from 'react';
import {
  LineChart, Sector, Cell, Tooltip, PieChart, Pie,
  Line, XAxis, YAxis, Legend,
  CartesianGrid, Bar, BarChart,
  ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  MenuItem,Panel, PageHeader,
  DropdownButton, Button,ButtonToolbar,
  ListGroup, ListGroupItem, Alert, Popover, OverlayTrigger,
} from 'react-bootstrap';
import Table from '../../../components/Table/common';
import vagueTime from 'vague-time';
import _ from 'lodash';
import * as cafe_waypoints from '../../../../../chat/components/delivery.com/cafe_waypoints.js';
import DatePicker from 'react-datepicker';
import moment from 'moment';


class WaypointHover extends Component {
  render() {
    return (
      <div>
        {this.props.waypoints.map(waypoint=>{
          if(waypoint.input) {
          return (
            <OverlayTrigger trigger="click" rootClose placement="top" overlay={createOverlay(waypoint.input)}>
              <a href='#'>{waypoint.action}</a>
            </OverlayTrigger>
            )}
          else {
            return waypoint.action;
          }
        }).reduce((accu, elem) => {
            return accu === null ? [elem] : [...accu, ' \u27A1 ', elem]
        }, null)

      }
      </div>

    );
  }
}

function createOverlay(text) {
    return (<Popover id={text.original_text}>
    {text.original_text}
    </Popover>)
}

class Session extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      currentTeam:'All Team',
      rows: [],
      startDate: moment().subtract(1, 'month'),
      endDate: moment(),
    };
    this.renderSessionsLineGraph = this.renderSessionsLineGraph.bind(this);
    this.renderWaypointTable = this.renderWaypointTable.bind(this);
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

  componentWillReceiveProps(nextProps){
    var self = this;
    var rows = [];
    var waypoints = nextProps.waypoints;
    var teamWaypoints = nextProps.teamId ? waypoints.filter(function(waypoint){
        return waypoint.user ? waypoint.user.team.team_id == nextProps.teamId : false;
    }) : waypoints;

    var waypointPaths = self.getWaypointPaths(teamWaypoints);
    for (var i = 0; i < waypointPaths.length; i++) {
      var teamName = waypointPaths[i].team_name;
      rows.push({time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: self.getWaypointActions(waypointPaths[i])})

    }
    var currentTeam = nextProps.teamName ? nextProps.teamName : 'All Team';

      self.setState({
        view: 'Store',
        currentTeam: currentTeam,
        rows: rows,
      })
  }

  componentDidMount() {
    var self = this;
    var rows = [];
    var waypoints = self.props.waypoints;
    var teamWaypoints = self.props.teamId ? waypoints.filter(function(waypoint){
        return waypoint.user ? waypoint.user.team.team_id == self.props.teamId : false;
    }) : waypoints;

    var waypointPaths = self.getWaypointPaths(teamWaypoints);
    for (var i = 0; i < waypointPaths.length; i++) {
      var teamName = waypointPaths[i].team_name;
      rows.push({time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: self.getWaypointActions(waypointPaths[i])})

    }
    var currentTeam = self.props.teamName ? self.props.teamName : 'All Team';

      self.setState({
        view: 'Store',
        currentTeam: currentTeam,
        rows: rows,
      })
  }

  renderSessionsLineGraph(rows){
    var dataPlot = [];   //name:time_range #sessions, #teams
    var weekRanges=[];

    for(var i = 0; i<10; i++){
      weekRanges.push({index: i, startDate: new Date(moment().subtract(10-i, 'week')),endDate: new Date(moment().subtract(9-i, 'week')), numSessions:0, teams:[]});
    }
    rows.map(function(row){
      var week = weekRanges.find(function(w){
        return new Date(row.time_stamp) > new Date(w.startDate) && new Date(row.time_stamp) <= new Date(w.endDate);
      });
      if(week){
        week.numSessions++;
        if(week.teams.length<1 || !week.teams.includes(row.team_name)) {
          week.teams.push(row.team_name);
        }
      }
    })

    for(var i=0;i<10;i++){
      var currentWeek = weekRanges.find((x) => x.index==i);
      if(currentWeek){
        dataPlot.push({name: currentWeek.endDate.toLocaleDateString(), numSessions: currentWeek.numSessions, numTeams: currentWeek.teams.length})
      }

    }

    return(
      <Panel
        header={<span><i className="fa fa-line-chart " />Cart Tracking</span>}>
          <div className="resizable">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPlot} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
                <XAxis dataKey="name" />
                 <YAxis yAxisId="left" orientation="left" stroke="#00FFFF"/>
                 <YAxis yAxisId="right" orientation="right" stroke="#ff8000"/>
                <CartesianGrid stroke="#ccc" />
                <Tooltip />
                    <Line type="monotone" yAxisId="left" dataKey="numSessions" stroke="#00FFFF" />
                    <Line type="monotone" yAxisId="right" dataKey="numTeams" stroke="#ff8000" />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </Panel>
    )
  }



  getWaypointPaths(waypoints){
    var userWaypoints = _.groupBy(waypoints,function(waypoint){
       return waypoint.user_id+'#'+waypoint.delivery_id
    });

    var data = _.map(userWaypoints, function(waypointArray){
      waypointArray = _.sortBy(waypointArray, [function(o) { return o.timestamp; }]);
      var pathLength = waypointArray.length;
      return {
            user_id: waypointArray[0].user ? waypointArray[0].user.name : '',
            time_stamp: waypointArray[0].timestamp,
            time_stamp_end: waypointArray[pathLength-1].timestamp,
            delivery_id: waypointArray[0].delivery_id,
            team_name: waypointArray[0].user ? waypointArray[0].user.team.team_name : '',
            inputs: waypointArray.map((waypoint) => waypoint.data),
            waypoints: waypointArray.map((waypoint) => waypoint.waypoint)
          }
    });
    return data;
  }

  getWaypointActions(waypointPaths) {
    let inputs = waypointPaths.inputs;
    let waypoints = waypointPaths.waypoints;

    return waypoints.map((waypoint, index) => {
      return {
        action: cafe_waypoints[Number(waypoint)],
        input: inputs[index] || ''
      }
    })
  }



  renderWaypointTable(rows, startDate, endDate){
    var filteredRows = rows.filter(function(row){
      return new Date(row.time_stamp) >= new Date(startDate) && new Date(row.time_stamp) <= new Date(endDate)
    })

    return(
        <Table heads={[{
          field: 'time_stamp',
          descrip: 'Session Time Started',
          allowSort: true,
          sort: (a, b, order) => order == 'desc' ?
              new Date(b.time_stamp) - new Date(a.time_stamp)
              : new Date(a.time_stamp) - new Date(b.time_stamp)
        }, {
          field: 'time_stamp_end',
          descrip: 'Session Time of Last Activity',
          allowSort: true,
          sort: (a, b, order) => order == 'desc' ?
              new Date(b.time_stamp_end) - new Date(a.time_stamp_end)
              : new Date(a.time_stamp_end) - new Date(b.time_stamp_end)
        },{
          field: 'user_id',
          descrip: 'User ID',
          allowSort: true
        }, {
          field: 'team_name',
          descrip: 'Team Name',
          allowSort: true,
        }, {
          field: 'actions',
          descrip: 'User Actions',
          allowSort: true,
          dataFormat: (cell, row)=> <WaypointHover waypoints={cell}/>
        }]} data={filteredRows} />
    )
  }


  render(){
    var self = this;
    return (
      <div>
        <div className="row">
          <div className="col-lg-12">
            <PageHeader>{self.state.currentTeam} Sessions</PageHeader>
          </div>
        </div>
        <div className="container-fluid data-display">
          <div>
              {self.renderSessionsLineGraph(self.state.rows)}
          </div>
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
          <div className="panel panel-default fillSpace">
            <Panel header={<span><i className="fa fa-table fa-fw" />{self.state.view} Waypoint Routes</span>}>
            { self.state.view=='Store' ? 'Placeholder for store waypoints stuff.' : self.renderWaypointTable(self.state.rows, self.state.startDate, self.state.endDate) }
            </Panel>
          </div>
        </div>
      </div>
    );
  }

}

export default Session;
