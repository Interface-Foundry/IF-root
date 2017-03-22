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

const waypointsCount = [ 
  { waypoint: 1001, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 111 },
  { waypoint: 1010,users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 129 },
  { waypoint: 1020,users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 118 },
  { waypoint: 1100,users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 124 },
  { waypoint: 1101, users: [ 'U3H5E1ANN', 'U3620AA5T' ], total: 109 },
  { waypoint: 1102,users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 62 },
  { waypoint: 1110,users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 93 },
  { waypoint: 1111,users: [ 'U3H5E1ANN', 'U3620AA5T' ], total: 32 },
  { waypoint: 1112, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1120, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 32 },
  { waypoint: 1140, users: [ 'U3620AA5T' ], total: 14 },
  { waypoint: 1210, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 153 },
  { waypoint: 1211, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1220, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 56 },
  { waypoint: 1230, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 42 },
  { waypoint: 1240, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 4 },
  { waypoint: 1300, users: [ 'U3620AA5T' ], total: 38 },
  { waypoint: 1310, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1313, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1320, users: [ 'U3620AA5T' ], total: 24 },
  { waypoint: 1321, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1323, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1330, users: [ 'U3620AA5T' ], total: 19 },
  { waypoint: 1332, users: [ 'U3620AA5T' ], total: 19 } ];

const COLORS = ['#FF0000', '#FF8888', '#0000FF', '#8888FF'];

function sumTeamStats(teams){
  	var total = 0;
  	for(var i = 0; i<teams.length; i++){
  		total += teams[i].carts.length;
  	}
  	return total;
  }

function getPieChartTeamStatsData(teams, team){ // [store item count, store order count, cafe item count, cafe order count]
  const data = [];
  var numCafeOrders = team ? teams.find(function(t){return t.team_id==team}).carts.length : sumTeamStats(teams);
 
  const sampleData = [ 16, 11, 80, 64 ];
  data.push({name: '# Store Items', value: sampleData[0]})
  data.push({name: '# Store Orders', value: sampleData[1]})
  data.push({name: '# Cafe Items', value: sampleData[2]})

  data.push({name: '# Cafe Orders', value: numCafeOrders})
  return data;
}

const orderTimePlaceFrequencies = [ { hour: 10, location: [ '122 W 27th St' ], total: 1 },
  { hour: 11,
    location: [ '7502 178th St', '122 W 27th St' ],
    total: 9 },
  { hour: 12,
    location: [ '7502 178th St', '122 W 27th St' ],
    total: 8 },
  { hour: 13,
    location: [ '7502 178th St', '122 W 27th St' ],
    total: 3 },
  { hour: 14,
    location: [ '122 W 27th St', '902 Broadway' ],
    total: 8 },
  { hour: 15,
    location: [ '7502 178th St', '122 W 27th St', '902 Broadway' ],
    total: 23 },
  { hour: 16,
    location: [ '122 W 27th St', '902 Broadway', '7502 178th St' ],
    total: 9 },
  { hour: 17, location: [ '122 W 27th St' ], total: 4 },
  { hour: 18, location: [ '122 W 27th St' ], total: 6 } ];


const dayOfWeekStats = [ { dayString: 'Sunday', dayNumber: 1, total: 7932 },
  { dayString: 'Monday', dayNumber: 2, total: 21892 },
  { dayString: 'Tuesday', dayNumber: 3, total: 42004 },
  { dayString: 'Wednesday', dayNumber: 4, total: 29934 },
  { dayString: 'Thursday', dayNumber: 5, total: 26266 },
  { dayString: 'Friday', dayNumber: 6, total: 25602 },
  { dayString: 'Saturday', dayNumber: 7, total: 7219 } 
];

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



// function getTeamName(delivery_id, teams){
//   return delivery_id
//   var team = teams.find(function(t){return t.carts.length>0 ? t.carts.find(function(foodSession){return foodSession.id==delivery_id}) : false});
//   var teamName = team ? team.team_name : '';
//   return teamName;
// }

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

function displayFlotCharts(props, context) {
  context.setTitle(title);
  var rows = [];
  var waypoints = props.waypoints;
  var teams = props.teams;


  var teamWaypoints = props.teamId ? waypoints.filter(function(waypoint){

      return waypoint.user ? waypoint.user.team.team_id == props.teamId : false;
      
      // var team = teams.find(function(t){return t.carts.length>0 ? t.carts.find(function(cart){return cart._id==waypoint._id}) : false});
      // var teamId = team ? team.team_id : '';
      // return teamId == props.teamId;
  }) : waypoints;

  var waypointPaths = getWaypointPaths(teamWaypoints);
  for (var i = 0; i < waypointPaths.length; i++) {

    var teamName = waypointPaths[i].team_name;
    rows.push({time_stamp: new Date(waypointPaths[i].time_stamp.split('.')[0]).toLocaleString(), time_stamp_end: new Date(waypointPaths[i].time_stamp_end.split('.')[0]).toLocaleString(), user_id: waypointPaths[i].user_id, team_name: teamName, actions: getWaypointActions(waypointPaths[i])})
  }
  var cells = [];
  for (var i = 0; i < 4; i++){
    cells.push(<Cell fill={COLORS[i]} />)
  }
  var currentTeam = props.teamName ? props.teamName : 'All Team';
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>{currentTeam} Stats</PageHeader>
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

      <div className="row">
        <div className="col-lg-6">
          <Panel header={<span>Team Stats Pie Chart</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <PieChart >
                  <Pie isAnimationActive={false} data={getPieChartTeamStatsData(teams,props.teamId)}  label>
                    {cells}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>


        <div className="col-lg-6">
          <Panel header={<span>Total # of Messages by Day of Week</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <BarChart
                  data={dayOfWeekStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="dayString" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#F2D2C4" />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="col-lg-6">
          <Panel header={<span>Orders by Time of Day in the past Month</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <BarChart
                  data={orderTimePlaceFrequencies}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#FA74AA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="col-lg-6">

          <Panel header={<span>Waypoints of past 2 weeks</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <AreaChart width={600} height={400} data={waypointsCount}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                  <XAxis dataKey="waypoint"/>
                  <YAxis/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Tooltip />
                  <Legend />
                  <Area type='monotone' dataKey='total' stroke='#000000' fill='#BBB44F' />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

        </div>

      </div>
    </div>
  );
}

displayFlotCharts.propTypes = {
  
};

displayFlotCharts.contextTypes = { setTitle: PropTypes.func.isRequired };

export default displayFlotCharts;
