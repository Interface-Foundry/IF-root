import { gql } from 'react-apollo';


export const cartsQuery = gql`
query ($startDate: String!, $endDate: String!, $purchased: Boolean) {
  carts(limit: 1000, start_date: $startDate, end_date: $endDate, purchased: $purchased) {
    created_date,
    team{team_name},
    type,
    item_count,
    cart_total,
    items {title, purchased}
  }
}`;

export const deliveryQuery = gql`
query ($startDate: String!, $endDate: String!, $purchased: Boolean) {
  deliveries(limit: 10, start_date: $startDate, end_date: $endDate, completed_payment: $purchased) {
    time_started,
    team_id,
    item_count,
    cart_total,
    chosen_restaurant,
    team {
      team_name,
      members {
        name,
        id
      }
    },
    order,
    cart,
    type,
    items {
      item_name,
      user
    }
  }
}`;

export const teamCartsQuery = gql`
        query ($team_id: String!){
          teams(team_id:$team_id){
            members{id,name,is_admin}, meta{all_channels},carts {_id, slack_id,purchased, created_date, cart_total,item_count, items {title, purchased, price, category, added_by, }}
          }
        }
      `;