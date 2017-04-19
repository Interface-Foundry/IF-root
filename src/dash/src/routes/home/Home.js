import React, { PropTypes, Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Panel, Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { gql, graphql } from 'react-apollo';

import { CartGraph, CafeGraph } from '../../components/Graphs';
import { CafeTable, CartTable } from '../../components/Table';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      startDate: moment().subtract(1, 'month'),
      endDate: moment(),
    };
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.changeCart = this.changeCart.bind(this);
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
        query DeliveriesInDateRange($startDate: String!, $endDate: String!){
          deliveries(limit: 10, start_date: $startDate, end_date: $endDate){
            time_started, team_id, item_count, cart_total, chosen_restaurant, team{team_name, members{name,id}}, order, cart, type, items {item_name, user}
          }
        }
      `;
    } else if (this.state.view === 'Store') {
      //store query
      currentQuery = gql`
        query CartsInDateRange($startDate: String!, $endDate: String!){
          carts(limit: 10, start_date: $startDate, end_date: $endDate){created_date, team{team_name}, type, item_count, cart_total, items{title,purchased}}
        }
      `;
    }
    return currentQuery;
  }

  render(){
    var self = this;

    const currentQuery = this.getCurrentQuery();
    const gqlWrapper = graphql(currentQuery, {
      options: {
        variables: {
          startDate: self.state.startDate,
          endDate: self.state.endDate,
        },
      },
    });

    const TableWithData = gqlWrapper(getCurrentTable);
    const GraphWithData = gqlWrapper(getCurrentGraph);

    return (

      <div>
        <div>
          <GraphWithData />
        </div>
        <div className="container-fluid data-display">
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
          <div className="panel panel-default">
          <Panel header={<span><i className="fa fa-line-chart " />  Using: {self.state.view}</span>}>
            <TableWithData />
          </Panel>
          </div>
        </div>
      </div>
    )
  }
}

const getCurrentGraph = ({ data }) => {
  if (data.loading) {
    return <p> Loading... </p>
  }

  if (data.deliveries) {
    return (<CafeGraph data={data.deliveries} />);
  }
  if (data.carts) {
    return (<CartGraph data={data.carts} />)
  }
};


const getCurrentTable = ({ data }) => {
  if (data.loading) {
    return <p> Loading... </p>
  }

  if (data.deliveries) {
    return (<CafeTable data={data.deliveries} />);
  }
  if (data.carts) {
    return (<CartTable data={data.carts} />)
  }
};

export default Home;
