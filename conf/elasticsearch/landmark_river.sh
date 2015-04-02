curl -XPUT "localhost:9200/_river/landmark_river/_meta" -d '
{
	"type": "mongodb",
	"mongodb": { 
		"servers": [
			{ "host": "localhost", "port": 27017 },
			{ "host": "localhost", "port": 27018 }
		],
		"options": { 
			"secondary_read_preference" : true, 
			"include_fields": ["name", "summary", "description", "type", "subType"]
		},
		"db": "if", 
		"collection": "landmarks" 
	}, 
	"index": { 
		"name": "if", 
		"type": "landmarks"
	}
}'
