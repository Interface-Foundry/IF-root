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
import Table from '../../../components/Table/common';
import vagueTime from 'vague-time';
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

/*
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
*/

/*
const dayOfWeekStats = [ { dayString: 'Sunday', dayNumber: 1, total: 7932 },
  { dayString: 'Monday', dayNumber: 2, total: 21892 },
  { dayString: 'Tuesday', dayNumber: 3, total: 42004 },
  { dayString: 'Wednesday', dayNumber: 4, total: 29934 },
  { dayString: 'Thursday', dayNumber: 5, total: 26266 },
  { dayString: 'Friday', dayNumber: 6, total: 25602 },
  { dayString: 'Saturday', dayNumber: 7, total: 7219 }
];
*/


function displayTeamStats(props, context) {
  context.setTitle(title);
  var rows = [];
  var teams = props.teams;


  var cells = [];
  for (var i = 0; i < 4; i++){
    cells.push(<Cell key={i} fill={COLORS[i]} />);
  }
  var currentTeam = props.teamName ? props.teamName : 'All Team';

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>{currentTeam} Stats</PageHeader>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <Panel header={<span>Team Stats Pie Chart</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <PieChart >
                  <Pie isAnimationActive={false} data={getPieChartTeamStatsData(teams, props.teamId)}  label>
                    {cells}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )

  /*
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
                  <Pie isAnimationActive={false} data={getPieChartTeamStatsData(teams, waypoints, props.teamId)}  label>
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
  */
}

displayTeamStats.propTypes = {

};

displayTeamStats.contextTypes = { setTitle: PropTypes.func.isRequired };

export default displayTeamStats;
