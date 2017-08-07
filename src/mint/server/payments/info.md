keeping info here



what an invoice, payment, paymentsource, etc is

- invoice is the conglomerate object for mint cart that users can checkout through kip (i.e. not checking out themselves through the site used), it is the main resource for the invoice page.  invoice has a uuid to look it up similar to cart
- payment is a payment to an invoice i.e. a recurring stripe charge would pay towards an invoice total.  a payment is from an individual user and relates to a specific invoice.  a payment typically will come from or be related to a paymentsource
- paymentsource is the saved info relating to a payment that we can typically action on, i.e. create charges on.  related to a specific user and is only functionally useful for stripe cards since paypal system does not work this way.  


## payment sources

### stripe
for stripe we are having user enter their card into the stripe react components.  the stripe react component uses the stripe.js file to integrate with the stripe system and hits our backend via invoice-api.js to save the source so we can later display this info back to the user if they want to reuse a card.  all the info we save is received from stripe but we create the charge amount

### paypal
paypal system works differently from stripe b/c the user is checking out from the paypal system (i.e. they are forwarded to the paypal site and login, then can checkout with amount that we specify).  the system should theoretically be able to refund either manually or from the sdk/paypal api but can't get either to actually work (the sandbox page seems to error out for most actions).  we do not have a payment source when a user charges via paypal express checkout button.


## frontend

### process
1. admin clicks checkout, checkout via kip
2. goes to invoice page
3. admin selects options and pays
4. users pay
5. once all users have paid then email kip admin to checkout items
6. items shipped to kip and then forwarded

### invoice page

#### admin options
- payment type selection
    + each individual pays for their own items
    + admin pays for all items
    + split cart equally 
- shipping and kip fee
    + kip fee undecided still 
    + shipping fee's probably will depend on sites along with destinations
- address

#### users invoice page
- what items they have added, what they are paying for  
- ability to pay for whatever 


---

# todo
- tests
- backend
- frontend


# todo - cafe - a.k.a. irrelevant for time being 
- old cafe stuff: 
    + probably need a way to get the delivery document related to a cart back to mint stuff in another route
    + everything that was done in kip_pay stuff that shared db needs now to be sent to a cafe route and updated there, (credit card info off the top of my head)
    + store credit card -> move to webserver.js