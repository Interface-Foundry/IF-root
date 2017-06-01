class Payment {
  constructor(paymentSource) {
    this.paymentSource = paymentSource
  }

  // methods
}


class StripePayment extends Payment {
  constructor(args) {
    super('stripe')
  }

  // methods
}