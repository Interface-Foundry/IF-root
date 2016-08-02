VERSION=0.7.5.2

docker build -t gcr.io/kip-styles/slack_test:$VERSION -f Dockerfiles/slack_test.Dockerfile .
docker build -t gcr.io/kip-styles/reply_test:$VERSION -f Dockerfiles/reply_logic_test.Dockerfile .
gcloud docker push gcr.io/kip-styles/slack_test:$VERSION
gcloud docker push gcr.io/kip-styles/reply_test:$VERSION


docker build -t gcr.io/kip-styles/slack:$VERSION -f Dockerfiles/slack.Dockerfile .
docker build -t gcr.io/kip-styles/reply:$VERSION -f Dockerfiles/reply_logic.Dockerfile .
docker build -t gcr.io/kip-styles/parser:$VERSION -f Dockerfiles/parser.Dockerfile .

gcloud docker push gcr.io/kip-styles/slack:$VERSION
gcloud docker push gcr.io/kip-styles/reply:$VERSION
gcloud docker push gcr.io/kip-styles/parser:$VERSION


# docker tag src_slack gcr.io/kip-ai/slack:$VERSION
# docker tag src_reply gcr.io/kip-ai/reply:$VERSION
# docker tag src_rnn gcr.io/kip-ai/rnn:$VERSION
# docker tag src_parser gcr.io/kip-ai/parser:$VERSION
# docker tag src_image gcr.io/kip-ai/image:$VERSION

docker tag src_slack gcr.io/kip-styles/slack:$VERSION
docker tag src_reply gcr.io/kip-styles/reply:$VERSION
docker tag src_parser gcr.io/kip-styles/parser:$VERSION
docker tag src_rnn gcr.io/kip-styles/rnn:$VERSION
docker tag src_image gcr.io/kip-styles/image:$VERSION

# gcloud docker push gcr.io/kip-ai/slack:$VERSION
# gcloud docker push gcr.io/kip-ai/reply:$VERSION
# gcloud docker push gcr.io/kip-ai/rnn:$VERSION
# gcloud docker push gcr.io/kip-ai/parser:$VERSION
# gcloud docker push gcr.io/kip-ai/image:$VERSION

gcloud docker push gcr.io/kip-styles/slack:$VERSION
gcloud docker push gcr.io/kip-styles/reply:$VERSION
gcloud docker push gcr.io/kip-styles/parser:$VERSION
gcloud docker push gcr.io/kip-styles/rnn:$VERSION
gcloud docker push gcr.io/kip-styles/image:$VERSION


# kubectl run image --port=5000 --image=gcr.io/kip-ai/image:$VERSION
# kubectl run slack --port=8000 --image=gcr.io/kip-ai/slack:$VERSION
# kubectl run reply --port=27017 --image=gcr.io/kip-ai/reply:$VERSION
# kubectl run parser --port=8083 --image=gcr.io/kip-ai/parser:$VERSION
# kubectl run rnn --port=8085 --image=gcr.io/kip-ai/rnn:$VERSION


kubectl run image --port=5000 --image=gcr.io/kip-styles/image:$VERSION
kubectl run slack --port=8000 --image=gcr.io/kip-styles/slack:$VERSION
kubectl run reply --port=27017 --image=gcr.io/kip-styles/reply:$VERSION
kubectl run parser --port=8083 --image=gcr.io/kip-styles/parser:$VERSION
kubectl run rnn --port=8085 --image=gcr.io/kip-styles/rnn:$VERSION

kubectl expose deployment parser
kubectl expose deployment rnn
kubectl expose deployment image

kubectl expose deployment parser --type=LoadBalancer
kubectl expose deployment rnn --type=LoadBalancer

kubectl delete deployment image parser reply rnn slack