curl -XPUT 'localhost:9200/if' -d '
{
	"mappings": {
		"landmarks": {
			"properties": {
				"loc": {
					"type": "object",
					"properties": {
						"coordinates": { "type": "geo_point" }
					}
				}
			}
		}
	}
}'
