keeping info here



what an invoice, payment, etc is

- invoice is the conglomerate charge for mint/cafe/any other type thing, it is the main resource we should act on i.e. /:invoice_type/, 
invoice should have id to look it up similar to cart

- payment is a payment to an invoice i.e. a recurring stripe charge would pay towards an invoice total
    + only handling one payment per invoice atm since im already confused


## plan for cafe:

ideally user would select something like new card on slack, 
would get url that goes to kipthis.com/pay/:invoice_id where enter stripe details and pay (and we save etc.)


### for saved card:
1. from old handlers -> post to /cafe/stripe with body containing which card AND order info 
2. create payment document in mint db 
    - possibly also post back to old server and create document there
3. create stripe charge from previous card  
4. pay for delivery.com order 
5. send back delivery.com response to slack url (new route in webserver.js most likely)


### for new card: 
1. from old handlers -> post to /cafe/stripe/new with order info 
2. create invoice from post that user can enter card info on
3. goto page to enter card/stripe details with total amount 
4. 



---

# todo

- old cafe stuff: 
    + probably need a way to get the delivery document related to a cart back to mint stuff in another route
    + everything that was done in kip_pay stuff that shared db needs now to be sent to a cafe route and updated there, (credit card info off the top of my head)
    + store credit card -> move to webserver.js
- tests
    + creating tests should 