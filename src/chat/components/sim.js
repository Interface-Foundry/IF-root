var cash = 200;
var e = 4;
var burn_rate = 6*4 + 2 + 1; // 5k/month/employee with 2k to rent the desks and 1k to do server stuff

for (var m = 0; m < 24; m++) {
  console.log(`month ${m}, cash ${cash}, employees ${e}, burn rate ${burn_rate}`)

  // hiring and raises every 3 months
  if (m % 3 === 0) {
    e++;
    burn_rate = burn_rate + 6 + 1;
  }

  // PR firm
  if (m >= 2 && m <= 4) {
    cash = cash - 20; // 20k/month to the PR firm for a 3 month campaign
  }

  // series A in 6 months
  if (m === 6) {
    cash = cash + 2000;
  }

  cash = cash - burn_rate;
}
