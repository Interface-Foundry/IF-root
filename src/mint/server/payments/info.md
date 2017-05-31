keeping info here

what an invoice, payment, etc is

invoice is the conglomerate 

## plan for cafe:

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
- tests
    + creating tests should 