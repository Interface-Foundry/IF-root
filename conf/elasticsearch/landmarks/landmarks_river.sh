curl -XPUT "localhost:9200/_river/landmark_river/_meta" -d '
{
	"type": "mongodb",
	"mongodb": { 
		"db": "if", 
		"collection": "landmarks" 
	}, 
	"index": { 
		"name": "if", 
		"type": "landmarks"
	}
}'
