curl -XGET 'localhost:9200/foundry/landmarks/_search?search_type=scan&scroll=10m&size=50' -d '
{
    "query" : {
        "match_all" : {}
    }
}'
