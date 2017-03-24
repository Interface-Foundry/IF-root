/**
 * @file - defines the schemas, their attributes, and the attribute types
 */

export default `
# these scalars are defined in the resolver.
scalar JSON
scalar Date

type Cart {
  _id: String!
  slack_id: String
  purchased: Boolean
  deleted: Boolean
  created_date: String
  purchased_date: String
  type: String
  link: String
  amazon: JSON
  # Foreign refs
  items: [Item]
}

type Chatuser {
  _id: String!
  user_id: String
  platform: String
  onboarded: Boolean
  admin_shop_onboarded: Boolean
  member_shop_onboarded: Boolean
  ts: String
  origin: String
  type: String
  dm: String
  team_id: String
  name: String
  deleted: Boolean
  color: String
  real_name: String
  tz: String
  tz_label: String
  tz_offset: String
  country: String
  is_admin: Boolean
  is_owner: Boolean
  is_primary_owner: Boolean
  is_restricted: Boolean
  is_ultra_restricted: Boolean
  is_bot: Boolean
  has_2fa: Boolean
  last_call_alerts: Boolean
  emailNotification: Boolean
  awaiting_email_response: Boolean
  phone_number: String
  first_name: String
  last_name: String
  # Foreign refs
  team: Slackbot
}

type Delivery {
  _id: String!
  active: Boolean
  session_id: String
  team_id: String
  onboarding: Boolean
  chosen_restaurant: String
  budget: String
  user_budgets: String
  menu: String
  chosen_channel: String
  fulfillment_method: String
  instructions: String
  time_started: String
  mode: String
  action: String
  data: String
  delivery_post: String
  order: String
  tip: String
  service_fee: String
  coupon: String
  main_amount: String
  calculated_amount: String
  discount_amount: String
  payment_post: String
  payment: String
  guest_token: String
  completed_payment: Boolean
  delivery_error: String
  # Foreign refs
  team: Slackbot
}

type Item {
  _id: String!
  cart_id: String
  title: String
  image: String
  description: String
  price: String
  ASIN: String
  rating: String
  review_count: String
  added_by: String
  slack_id: String
  source_json: String
  purchased: Boolean
  purchased_date: Boolean
  deleted: Boolean
  added_date: String
  bundle: String
  available: Boolean
  asins: String
  config: String
  # Foreign refs
  cart: Cart
}

type Message {
  _id: String!
  thread_id: String
  origin: String
  mode: String
  action: String
  team: String
  channel: String
  user: String
  user_id: String
  cart_reference_id: String
  incoming: Boolean
  original_text: String
  text: String
  original_query: String
  url_shorten: [String]
  ts: String
  source_ts: String
  slack_ts: String
  replace_ts: String
  action_ts: String
  amazon: String
}

type Metric {
  _id: String!
  metric: String
  data: String
}

type SlackbotMeta {
  addedBy: String
  dateAdded: String
  deleted: Boolean
  cart_channels: [String]
  collect_from: String
  initialized: Boolean
  office_assistants: [String]
  weekly_status_enabled: Boolean
  weekly_status_day: String
  weekly_status_date: String
  weekly_status_time: String
  weekly_status_timezone: String
}

type Slackbot {
  _id: String!
  team_id: String
  team_name: String
  access_token: String
  scope: String
  meta: SlackbotMeta
  incoming_webhook_url: String
  incoming_webhook_channel: String
  bot_user_id: String
  bot_access_token: String
  status_interval: String
  city: String
  chosen_location: String
  fulfillment_method: String
  mock: Boolean
  p2p: Boolean
  used_coupons: String
  # Foreign refs
  members: [Chatuser]
  carts: [Cart]
}

type User {
  _id: String!
  email: String
}

type Waypoint {
  _id: String!
  delivery_id: String
  user_id: String
  waypoint: String
  data: JSON
  timestamp: String
  # Foreign refs
  user: Chatuser
  delivery: Delivery
}


type Query {
  carts(
    limit: Int
    offset: Int
    _id: String
  ): [Cart]

  deliveries(
    limit: Int
    offset: Int
    _id: String
  ): [Delivery]

  items(
    limit: Int
    offset: Int
    _id: String
  ): [Item]

  me: [User]

  messages(
    limit: Int
    offset: Int
    _id: String
  ): [Message]

  metrics(
    limit: Int
    offset: Int
    _id: String
  ): [Metric]

  teams(
    limit: Int
    offset: Int
    team_id: String
  ): [Slackbot]

  users(
    limit: Int
    offset: Int
    _id: String
  ): [Chatuser]

  waypoints(
    limit: Int
    offset: Int
    _id: String
    user_id: String
  ): [Waypoint]
}

type Mutation{
  setItemAsPurchased(itemId: String!): Item
}

type schema {
  query: Query
  mutation: Mutation
}
`
