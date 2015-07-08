curl -XGET localhost:9200/foundry/landmarks/_search?pretty=t -d '{
"query":
{
	"multi_match": {
		"query":                "loft",
		"type":                 "best_fields", 
		"fields":               [ "name", "summary" ],
		"fuzziness": 2,
		"prefix_length": 1,
		"tie_breaker":          0.3,
		"minimum_should_match": "30%" 
	}
}
}'
