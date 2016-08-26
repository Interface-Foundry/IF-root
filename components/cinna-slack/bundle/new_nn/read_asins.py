import gzip, json

with open('test_asins.txt', 'w') as f1:
    with open('asins.txt', 'r') as f2:
        for i in range(100):
        	f1.write(f2.readline())