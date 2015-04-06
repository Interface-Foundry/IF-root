curl -XGET localhost:9200/if/landmarks/_search?pretty=t -d '{
"query":
{
"filtered" : {
	"query": {
		"match_all": {}
	},
	"filter": {
	"geo_distance": {
		"distance": "100km",
		"loc.coordinates": [-117.8351974, 33.7967606]
	}
}
}
}
}'
