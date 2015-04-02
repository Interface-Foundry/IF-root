curl -XPUT 'localhost:9200/if' -d '
{
	"settings": {
		"analysis": {
			"filter": {
				"english_stop": {
					"type":       "stop",
					"stopwords":  "_english_" 
				},
				"english_keywords": {
					"type":       "keyword_marker",
					"keywords":   [] 
				},
				"english_stemmer": {
					"type":       "stemmer",
					"language":   "english"
				},
				"english_possessive_stemmer": {
					"type":       "stemmer",
					"language":   "possessive_english"
				},
				"if_synonyms": {
					"type": "synonym",
					"synonyms_path": "if_synonyms.txt"
				}

			},
			"analyzer": {
				"english": {
					"tokenizer":  "standard",
					"filter": [
						"english_possessive_stemmer",
						"lowercase",
						"english_stop",
						"english_keywords",
						"english_stemmer",
						"if_synonyms"
					]
				}
			}
		}
	}
}'
