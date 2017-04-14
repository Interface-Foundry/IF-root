import React, {
  Component,
  PropTypes
} from 'react';
import {Panel} from 'react-bootstrap';
import Table from './common';
import co from 'co';

class CartTable extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  cartsAreSame(cart1,cart2){
    if(cart1.length == cart2.length){
      if(JSON.stringify(cart1) == JSON.stringify(cart2)){
        return true;
      }
    }
      return false;
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.state.carts && this.cartsAreSame(nextState.carts,this.state.carts)){
      if(new Date(nextProps.start).toLocaleString() == new Date(this.props.start).toLocaleString() && new Date(nextProps.end).toLocaleString() == new Date(this.props.end).toLocaleString()){
        return false;
      }
    }
    return true;
  }

  componentDidUpdate(){
    var self = this;
    co(function * () {
        const data = self.props.data;
        if (data){
          let carts = data.reduce(self.props.process, []);
          self.setState({carts: carts},)
        } else  {
          throw new Error('Failed to load carts.')
        }
      })
  }

  componentDidMount() {
    var self = this;
    co(function * () {
        const data = self.props.data;
        if (data){
          let carts = data.reduce(self.props.process, []);
          self.setState({carts: carts})
        } else  {
          throw new Error('Failed to load carts.')
        }
    })
  }

  render() {
    const {carts} = this.state;
    const data = carts ? carts : [[]];
    return (
        <Table heads={this.props.heads} data={data} colorBy={this.props.colorBy} />
    )
  }


  renderCartTable(startDate, endDate){
    //console.log(new Date(startDate),new Date(endDate));
    //console.log(this.props);
    return (
      <Panel className='fillSpace' header={<span><i className="fa fa-fw"/> Purchased Store Carts from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>}>

        <CartTable
                start = {startDate}
                end = {endDate}
                data = {this.props.data}
                heads = {
                  [{
                    field: 'created_date',
                    descrip: 'Created Date',
                    allowSort: true,
                    sort: (a, b, order) => order == 'desc' ?
                        new Date(b.created_date) - new Date(a.created_date)
                        : new Date(a.created_date) - new Date(b.created_date)
                  },
                  {
                    field: 'purchased_date',
                    descrip: 'Purchased Date',
                    allowSort: true,
                    sort: (a, b, order) => order == 'desc' ?
                        new Date(b.purchased_date) - new Date(a.purchased_date)
                        : new Date(a.purchased_date) - new Date(b.purchased_date)
                  },
                  {
                    field: 'team_name',
                    descrip: 'Slack ID'
                  },
                  {
                    field:'cart_total',
                    descrip: 'Cart Total'
                  },
                  {
                    field: 'items',
                    descrip: 'Cart Size'
                  },
                  {
                    field: 'category',
                    descrip: 'Category'
                  },
                  {
                    field: 'quantity',
                    descrip: 'Quantity'
                  },
                  {
                    field: 'price',
                    descrip: 'Item Price'
                  },
                  {
                    field: 'title',
                    descrip: 'Product Name'
                  }]
                }
                process = {
                  (teams, team) =>
                  teams.concat(
                    team.carts.reduce((carts, cart) => {
                        if(cart.amazon && cart.amazon.CartItems){
                          var self = this;
                          if(new Date(cart.created_date)>=new Date(startDate) && new Date(cart.created_date)<=new Date(endDate)){
                            carts.push({
                              team_name: team.team_name,
                              purchased_date: cart.purchased_date ? (new Date(cart.purchased_date)).toLocaleString() : 'Not Available',
                              created_date: (new Date(cart.created_date)).toLocaleString(),
                              items: cart.amazon.CartItems[0].CartItem.reduce(function(a,b){
                                  return a+Number(b.Quantity);
                                },0),
                              cart_total: cart.amazon.SubTotal[0].FormattedPrice,
                            });
                            cart.amazon.CartItems[0].CartItem.map(function(item){
                              var cartItem = cart.amazon.CartItems ? cart.amazon.CartItems[0].CartItem.find(function(i){
                                  return i.ASIN==item.ASIN
                                }) : '';
                              carts.push({
                                category: cartItem ? cartItem.ProductGroup : '',
                                quantity: item.Quantity,
                                price: item.Price[0].FormattedPrice,
                                title: item.Title
                              })
                            })
                          }
                        }
                      return carts;
                    }, [])

                  )
                }
        />
        </Panel>
      )

  }
}


export default CartTable;