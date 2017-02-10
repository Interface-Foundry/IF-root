import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import {
  LineChart, Tooltip, PieChart, Pie,
  Line, XAxis, YAxis, Legend,
  CartesianGrid, Bar, BarChart,
  ResponsiveContainer, AreaChart, Area } from '../../../vendor/recharts';

const title = 'Flot Charts';

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

const waypointsCount = [ { waypoint: 1001, users: [ 'U3620AA5T' ], total: 12 },
  { waypoint: 1010, users: [ 'U3620AA5T' ], total: 12 },
  { waypoint: 1020, users: [ 'U3620AA5T' ], total: 11 },
  { waypoint: 1100, users: [ 'U3620AA5T' ], total: 11 },
  { waypoint: 1101, users: [ 'U3620AA5T' ], total: 4 },
  { waypoint: 1102, users: [ 'U3620AA5T' ], total: 7 },
  { waypoint: 1110, users: [ 'U3620AA5T' ], total: 7 },
  { waypoint: 1111, users: [ 'U3620AA5T' ], total: 4 },
  { waypoint: 1120, users: [ 'U3620AA5T' ], total: 7 },
  { waypoint: 1121, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1130, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1140,
    users: [ 'U3H5E1ANN', 'U3620AA5T' ],
    total: 29 },
  { waypoint: 1200, users: [ 'U3620AA5T' ], total: 6 },
  { waypoint: 1210, users: [ 'U3H5E1ANN', 'U3620AA5T' ], total: 6 },
  { waypoint: 1211, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1220, users: [ 'U3620AA5T', 'U3H5E1ANN' ], total: 4 },
  { waypoint: 1230, users: [ 'U3H5E1ANN', 'U3620AA5T' ], total: 3 },
  { waypoint: 1240, users: [ 'U3H5E1ANN', 'U3620AA5T' ], total: 1 },
  { waypoint: 1300, users: [ 'U3620AA5T' ], total: 2 },
  { waypoint: 1310, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1313, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1320, users: [ 'U3620AA5T' ], total: 3 },
  { waypoint: 1321, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1323, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1330, users: [ 'U3620AA5T' ], total: 1 },
  { waypoint: 1332, users: [ 'U3620AA5T' ], total: 1 } ];

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


function displayFlotCharts(props, context) {
  context.setTitle(title);
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>Flot</PageHeader>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
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

      <div className="row">
        <div className="col-lg-6">
          <Panel header={<span>Pie Chart Example</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <PieChart >
                  <Pie isAnimationActive={false} data={pieChartData} fill="#8884d8" label />
                  <Tooltip />
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
          <Panel header={<span>CHARTS!</span>} >
            <div>
              Another chart here plz.
            </div>
          </Panel>
        </div>

        <div className="col-lg-12">
          <Panel header={<span>Flot Charts Usage</span>} >
            <div>
              <p>Flot is a pure JavaScript plotting library for jQuery, with a focus on simple
                usage, attractive looks, and interactive features. In SB Admin, we are using the
                most recent version of Flot along with a few plugins to enhance the user
                experience. The Flot plugins being used are the tooltip plugin for hoverable
                tooltips, and the resize plugin for fully responsive charts. The documentation
                for Flot Charts is available on their website,
                <a target="_blank" rel="noopener noreferrer" href="http://www.flotcharts.org/">
                  "http://www.flotcharts.org/"
                </a>.</p>
              <Button bsSize="large" block href="http://www.flotcharts.org/">View Flot Charts Documentation</Button>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
}

displayFlotCharts.contextTypes = { setTitle: PropTypes.func.isRequired };

export default displayFlotCharts;