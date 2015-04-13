curl -XGET localhost:9200/if/landmarks/_search?pretty=t -d '{
"query":
{
"filtered" : {
	"query": {
	"multi_match": {
		"query":                "food",
		"type":                 "best_fields", 
		"fields":               [ "name", "summary" ],
		"fuzziness": 2,
		"prefix_length": 1,
		"tie_breaker":          0.3,
		"minimum_should_match": "30%" 
	}
	},
	"filter": {
	"geo_distance": {
		"distance": "100km",
		"loc.coordinates": {
			"lat": 33.7967606,
			"lon": -117.8351974
		}
	}
}
}
}
}'
