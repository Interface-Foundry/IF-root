VERSION=0.7.4.10

docker run -d \
	--net=host \
	-p 8000:8000 \
	-e NODE_ENV='development' \
	gcr.io/kip-styles/web:$VERSION

docker run -d \
	--net=host \
	-e NODE_ENV='development' \
	gcr.io/kip-styles/reply_logic:$VERSION
