import React from 'react';
import { gql, graphql } from 'react-apollo';
import DeliveryTable from './DeliveryTable';

const deliveryQuery = gql`
  query {deliveries(limit: 10){time_started, team_id, item_count, cart_total, chosen_restaurant, team{team_name}, items {item_name, user}}}
`;

const GetTable = ({ data }) => {
  if (data.loading) {
    return <p>Loading ...</p>;
  }

  if (data.error) {
    return <p>{data.error.message}</p>;
  }
  // logic here for which table to load
  return (<DeliveryTable data={data.deliveries} />);
};

const RenderTable = graphql(deliveryQuery, { options: { notifyOnNetworkStatusChange: true }})(GetTable);

export default RenderTable;
