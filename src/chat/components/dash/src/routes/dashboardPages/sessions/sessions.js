import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import {
  LineChart, Sector, Cell, Tooltip, PieChart, Pie,
  Line, XAxis, YAxis, Legend,
  CartesianGrid, Bar, BarChart,
  ResponsiveContainer, AreaChart, Area } from '../../../vendor/recharts';
import {
  MenuItem,
  DropdownButton,
  ListGroup, ListGroupItem, Alert, Popover, OverlayTrigger
} from 'react-bootstrap';
import Table from '../../../components/Table';
import vagueTime from 'vague-time';
import _ from 'lodash';
import * as cafe_waypoints from '../../../../../delivery.com/cafe_waypoints.js';

const title = ' Team Stats';
''
function getWaypointPaths(waypoints){

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

function getWaypointActions(waypointPaths) {

  let inputs = waypointPaths.inputs;
  let waypoints = waypointPaths.waypoints;

  return waypoints.map((waypoint, index) => {
    return {
      action: cafe_waypoints[Number(waypoint)],
      input: inputs[index] || ''
    }
  })
}

class WaypointHover extends React.Component {
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

function Session(props, context) {
  context.setTitle(title);
  var rows = [];
  var waypoints = props.waypoints;
  var teams = props.teams;


  var teamWaypoints = props.teamId ? waypoints.filter(function(waypoint){
      return waypoint.user ? waypoint.user.team.team_id == props.teamId : false;
  }) : waypoints;

  var waypointPaths = getWaypointPaths(teamWaypoints);
  for (var i = 0; i < waypointPaths.length; i++) {
    var teamName = waypointPaths[i].team_name;
    rows.push({time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: getWaypointActions(waypointPaths[i])})
  }

  var currentTeam = props.teamName ? props.teamName : 'All Team';
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>{currentTeam} Sessions</PageHeader>
        </div>
      </div>

      <div className="panel panel-default fillSpace">
          <Panel header={<span>Table of Waypoint Routes</span>}>
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
            }]} data={rows} />
          </Panel>
      </div>

    </div>
  );
}

Session.propTypes = {
  
};

Session.contextTypes = { setTitle: PropTypes.func.isRequired };

export default Session;
