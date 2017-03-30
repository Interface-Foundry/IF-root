Mint database structure

- Mongodb today -> Postgres tmrw (yay waterline)
- Design consideration: 
  * All collections must be flat
    - no embedded documents, like cart.meta.userinitatorid BAD, instead cart.userid GOOD. 

# carts
- `cart_id`: the cart's id visible in the url
- participants: UserSessions
- creator: UserSession
- has many Items
- payment status [paid, reimbursed, etc?]
- has many Invoices


# user session
- ip
- mobile/etc ?
- UserAccount

# User Account
- email address

# Items (use current item schema)
- has one UserSession that added it
- quantity
- has one Source (like just Amazon for now)
- original url
- payment status

# Invoice
- has many Items (or N/A because it's an even split)
- UserAccount
- status [paid, failed, etc]
- payment
- collection emails sent

# Payment
- method [snapcash]

# Collection Email
- User Account
- Cart
- Message Body LITMUS




## invoices



