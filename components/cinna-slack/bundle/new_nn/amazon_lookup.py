
import bottlenose, json
import time

AMAZON_ACCESS_KEY = "AKIAIKMXJTAV2ORZMWMQ"
AMAZON_SECRET_KEY = "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"
AMAZON_ASSOC_TAG = "quic0b-20"

amazon = bottlenose.Amazon(AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOC_TAG)

with open('test_amazon_products', 'w') as f:
	with open('test_asins.txt', 'r') as f1:
		while True:
			line = f1.readline()
			

			json.dump(data, f, ensure_ascii=False)
			if not line: break