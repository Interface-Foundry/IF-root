import React, { PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import {
  LineChart, Tooltip, PieChart, Pie,
  Line, XAxis, YAxis, Legend,
  CartesianGrid, Bar, BarChart,
  ResponsiveContainer } from '../../../vendor/recharts';

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
          <Panel header={<span>Line Chart Example</span>} >
            <div>
              <ResponsiveContainer width="100%" aspect={2}>
                <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sine" stroke="#8884d8" />
                  <Line type="monotone" dataKey="cosine" stroke="#82ca9d" />
                </LineChart>
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
                  <Bar dataKey="total" fill="#8884d8" />

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
          <Panel header={<span>Moving Line Chart Example</span>} >
            <div>
              Panel contents
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
