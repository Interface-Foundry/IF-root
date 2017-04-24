import { gql } from 'react-apollo';


export const cartsQuery = gql`
query CartsInDateRange($startDate: String!, $endDate: String!){
  carts(limit: 10, start_date: $startDate, end_date: $endDate) {
    created_date,
    team{team_name},
    type,
    item_count,
    cart_total,
    items{title,purchased}
  }
}`;

export const deliveryQuery = gql`
query DeliveriesInDateRange($startDate: String!, $endDate: String!, $purchased: Boolean!){
  deliveries(limit: 10, start_date: $startDate, end_date: $endDate, purchased: false){
    time_started,
    team_id,
    item_count,
    cart_total,
    chosen_restaurant,
    team{team_name, members{name,id}},
    order,
    cart,
    type,
    items {item_name, user}
  }
}`;
