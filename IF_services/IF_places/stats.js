var stats = require("stats-lite")
var census = require("./census.json")
var rolls = []
for (var i = 0; i<census.length; i++) {
  rolls.push(census[i]["FIELD2"])
}

console.log("sum: %s", stats.sum(rolls))
console.log("mean: %s", stats.mean(rolls[1]))
console.log("median: %s", stats.median(rolls[1]))
console.log("mode: %s", stats.mode(rolls))
console.log("variance: %s", stats.variance(rolls))
console.log("standard deviation: %s", stats.stdev(rolls))
console.log("85th percentile: %s", stats.percentile(rolls, 0.85))