import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Panel, Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { graphql } from 'react-apollo';

import { CartGraph, CafeGraph } from '../../components/Graphs';
import { CafeTable, CartTable } from '../../components/Table';
import { cartsQuery, deliveryQuery } from '../../graphqlOperations';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      purchased: false,
      startDate: moment().subtract(1, 'month'),
      endDate: moment(),
    };
    this.changeStart = this.changeStart.bind(this);
    this.changeEnd = this.changeEnd.bind(this);
    this.changeCart = this.changeCart.bind(this);
  }

  // these could all be refactored into one vvv
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
    const queryHandler = {
      cafe: deliveryQuery,
      store: cartsQuery,
    };
    return queryHandler[this.state.view.toLowerCase()];
  }

  changeState(value) {
    this.setState(value);
  }


  render(){
    const self = this;

    let graphqlOptions = {
      variables: {
        startDate: self.state.startDate,
        endDate: self.state.endDate,
        purchased: self.state.purchased,
      },
    }

    const currentQuery = this.getCurrentQuery();
    const gqlWrapper = graphql(currentQuery, {
      options: graphqlOptions,
    });

    const TableWithData = gqlWrapper(getCurrentTable);
    const GraphWithData = gqlWrapper(getCurrentGraph);

    return (

      <div>

        <ButtonToolbar>
          <Button
            bsStyle={self.state.purchased === true ? 'primary' : 'default'}
            onClick={() => self.changeState({ purchased: true })}
          >Paid Carts</Button>
          <Button
            bsStyle={self.state.purchased === false ? 'primary' : 'default'}
            onClick={() => self.changeState({ purchased: false })}
          >Unpaid Carts</Button>
        </ButtonToolbar>

        <ButtonToolbar>
          <Button bsStyle={self.state.view=='Store' ? "primary" : "default"} onClick={ ()=> self.changeCart('Store')}>
            Store
          </Button>
          <Button bsStyle={self.state.view=='Cafe' ? "primary" : "default"} onClick={ ()=> self.changeCart('Cafe')}>
            Cafe
          </Button>
        </ButtonToolbar>
        <div>
          <GraphWithData />
        </div>
        <div className="container-fluid data-display">
          <div>
              Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />
              End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
          </div>
          <div className="panel panel-default">
            <Panel
              header={<span><i className="fa fa-line-chart " />Using: {self.state.purchased ? 'purchased Carts' : 'unpurchased carts'} for {self.state.view}</span>}>
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
