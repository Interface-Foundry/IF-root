import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Panel, Button, ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { graphql } from 'react-apollo';

import { CartGraph, CafeGraph, MintGraph } from '../../components/Graphs';
import { CafeTable, CartTable, MintTable } from '../../components/Table';
import { cartsQuery, deliveryQuery } from '../../graphqlOperations';
import * as mintdata from '../../data/mintdata';




class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Store',
      purchased: true,
      startDate: moment().subtract(6, 'month'),
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
      mint: cartsQuery, //change this when mint query is ready
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
        view: self.state.view,
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
        <div>
          <ButtonToolbar>
            <Button
              bsStyle={self.state.view.toLowerCase() === 'store' ? 'primary' : 'default'}
              onClick={()=> self.changeState({ view: 'Store'})}>
              Store
            </Button>
            <Button
              bsStyle={self.state.view.toLowerCase() === 'cafe' ? 'primary' : 'default'}
              onClick={() => self.changeState({ view: 'Cafe'})}>
              Cafe
            </Button>
            <Button
              bsStyle={self.state.view.toLowerCase() === 'mint' ? 'primary' : 'default'}
              onClick={() => self.changeState({ view: 'Mint'})}>
              Mint
            </Button>
          </ButtonToolbar>
        </div>
        <div>
          <GraphWithData />
        </div>
        <div>
          Start Date: <DatePicker selected={self.state.startDate} onChange={self.changeStart} />
          End Date: <DatePicker selected={self.state.endDate} onChange={self.changeEnd} />
        </div>
        <div>
          <TableWithData />
        </div>
    </div>
    )
  }
}


const getCurrentGraph = ({ data }) => {
  if (data.loading) {
    return <p> Loading... </p>
  }

  if (data.variables.view.toLowerCase() === 'cafe') {
    return (<CafeGraph data={data.deliveries} />);
  }
  if (data.variables.view.toLowerCase() === 'store') {
    return (<CartGraph data={data.carts.filter(c => c.items.length > 0)} />)
  }
  if (data.variables.view.toLowerCase() === 'mint') {
    return (<MintGraph data={mintdata.items} />) //change this when mint graph is ready
  }
};


const getCurrentTable = ({data}) => {
  if (data.loading) {
    return <p> Loading... </p>
  }
  if (data.variables.view.toLowerCase() === 'cafe') {
    return (<CafeTable data={data.deliveries} purchased={data.variables.purchased}/>);
  }
  if (data.variables.view.toLowerCase() === 'store') {
    return (<CartTable data={data.carts.filter(c => c.items.length > 0)} purchased={data.variables.purchased} />);
  }
  if (data.variables.view.toLowerCase() === 'mint') {
    return (<MintTable data={mintdata.items} purchased={data.variables.purchased} />); //change this when mint table is ready
  }
};

export default Home;
