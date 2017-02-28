import React, { PropTypes } from 'react';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, Alert
} from 'react-bootstrap';
import StatWidget from '../../../components/Widget';
import Donut from '../../../components/Donut';
import CartTable from '../../../components/CartTable';
import vagueTime from "vague-time";
import {
  Tooltip,
  XAxis, YAxis, Area,
  CartesianGrid, AreaChart, Bar, BarChart,
  ResponsiveContainer } from '../../../vendor/recharts';

const title = 'Pokemon Gym - Escape Velocity - Sessions';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/
const data = [
  { name: 'Page A', uv: 2000, pv: 240, amt: 20, value: 600 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 3000 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
  { name: 'Page D', uv: 2780, pv: 208, amt: 1000, value: 400 },
  { name: 'Page E', uv: 10, pv: 4800, amt: 2181, value: 200 },
  { name: 'Page F', uv: 2390, pv: 6800, amt: 2500, value: 700 },
  { name: 'Page G', uv: 8090, pv: 4300, amt: 2100, value: 100 },
];
/******* */

function sessions(props, context) {
  context.setTitle(title);
  return (
    <div className="container-fluid data-display">
      <Panel
        header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Purchased Carts
        </span>}>
          <div className="resizable">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid stroke="#ccc" />
                <Tooltip />
                <Area type="monotone" dataKey="uv" stackId="1" stroke="#8804d8" fill="#8884d8" />
                <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </Panel>
      <Panel className='fillSpace' header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Open Carts </span>}>
        <CartTable 
          query={'{teams{ team_name, carts {created_date,slack_id, items, purchased}}}'}
          heads={['Open Since', 'Created Date', 'Slack ID', 'Number of Items']}
          colorBy={2}
          process = {
            (teams, team) =>
              teams.concat(
                team.carts.reduce((carts, cart) => {
                  if (cart.purchased.toLowerCase() == 'false') {
                    carts.push(
                        [vagueTime.get({from: Date.now(), to: new Date(cart.created_date)}), (new Date(cart.created_date)).toLocaleString(), team.team_name, cart.items.split(',').length]
                      )
                  }
                  return carts;
                }, [])
              )
          }
          sort={(a, b) =>  new Date(b[1]) - new Date(a[1])}
        />
      </Panel>
    </div>
  );
}

sessions.propTypes = {
  // news: PropTypes.arrayOf(PropTypes.shape({
  //   title: PropTypes.string.isRequired,
  //   link: PropTypes.string.isRequired,
  //   contentSnippet: PropTypes.string,
  // })).isRequired,
};

sessions.contextTypes = { setTitle: PropTypes.func.isRequired };

export default sessions;
