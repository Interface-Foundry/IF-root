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
  ListGroup, ListGroupItem, Alert
} from 'react-bootstrap';
import Table from '../../../components/Table';
import CartTable from '../../../components/CartTable';
import vagueTime from 'vague-time';
import _ from 'lodash';
import * as cafe_waypoints from '../../../../../delivery.com/cafe_waypoints.js';

const title = ' Team Stats';

function plotData() {
  const data = [];
  const offset = 0;
  let sineValue;
  let cosValue;
  for (let i = 0; i < 12; i += 0.8) {
    sineValue = Math.sin(i + offset);
    cosValue = Math.cos(i + offset);
    data.push({ name: i, sine: sineValue, cosine: cosValue });
    // data.push({ name: i, cosine: cosValue });
  }
  return data;
}
const lineChartData = plotData();

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

const teamStats = [ 16, 11, 80, 64 ];
const COLORS = ['#FF0000', '#FF8888', '#0000FF', '#8888FF'];

function getPieChartTeamStatsData(teamStats){ // [store item count, store order count, cafe item count, cafe order count]
  const data = [];
  data.push({name: '# Store Items', value: teamStats[0]})
  data.push({name: '# Store Orders', value: teamStats[1]})
  data.push({name: '# Cafe Items', value: teamStats[2]})
  data.push({name: '# Cafe Orders', value: teamStats[3]})
  return data;
}

const pieChartTeamStatsData = getPieChartTeamStatsData(teamStats)

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



const pieChartData = [
  { name: 'Group A', value: 400 }, { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 }, { name: 'Group D', value: 200 },
  { name: 'Group E', value: 278 }, { name: 'Group F', value: 189 },
];

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


    return {
            user_id: waypointArray[0].user_id,
            delivery_id: waypointArray[0].delivery_id,
            waypoints: waypointArray.map((waypoint) => waypoint.waypoint)
        }
  });

  return data;
}

const ordersHeads = [
  'Date / Time',
  'Team',
  'User',
  'Item',
  'Price',
  'Quantity',
  'Total',
  'Cart ID',
  'Platform'
];
const ordersData = [
  ['01/15/17 3:15 pm',
    'kipsearch',
    'Alyx Baldwin',
    'Shnozzleberries',
    '$2,321.55',
    '2',
    '$5,643.10',
    'slack_212344234',
    'slack'
  ], ['01/22/17 8:15 pm',
    'kipsearch',
    'Alyx Baldwin',
    'Berryberries',
    '$1,218.63',
    '5',
    '$6,093.15',
    'slack_212344234',
    'slack'
  ]
];
 
function getWaypointActions(waypoints){
 
  var lastWaypoints = waypoints.slice(-3).map((waypoint) => Number(waypoint));
  var lastActions = lastWaypoints.map((waypoint) => cafe_waypoints[waypoint]).join('\u27A1');

  //console.log(cafe_waypoints);

  return lastActions;
}

function displayFlotCharts(props, context) {
  context.setTitle(title);
  var rows = [];

  var waypoints = props.waypoints;

  var teamWaypoints = props.teamId ? waypoints.filter(function(waypoint){
      return waypoint.food_session ? waypoint.food_session.team_id == props.teamId : false;
  }) : waypoints;

  var waypointPaths = getWaypointPaths(teamWaypoints);
  for (var i = 0; i < waypointPaths.length; i++) {
    rows.push([waypointPaths[i].user_id, waypointPaths[i].delivery_id, waypointPaths[i].waypoints.join('\u27A1'), getWaypointActions(waypointPaths[i].waypoints)])
  }

  var cells = [];
  for (var i = 0; i < teamStats.length; i++){
    cells.push(<Cell fill={COLORS[i]} />)
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>Team Stats</PageHeader>
        </div>
      </div>

      <div className="row">
        <div>
          <Panel header={<span>Table of Waypoint Routes</span>}>
            <div className="table-responsive">
              <Table heads={['User ID','Delivery ID','FoodSession Waypoint Route', 'Last Actions']} data={rows} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <Panel header={<span>Team Stats Pie Chart</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <PieChart >
                  <Pie isAnimationActive={false} data={pieChartTeamStatsData}  label>
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
