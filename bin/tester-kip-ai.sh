VERSION=0.7.5.0.1

docker build -t gcr.io/kip-ai/slack:$VERSION -f Dockerfiles/slack.Dockerfile .
docker build -t gcr.io/kip-ai/reply:$VERSION -f Dockerfiles/reply_logic.Dockerfile .
docker build -t gcr.io/kip-ai/parser:$VERSION -f Dockerfiles/parser.Dockerfile .
docker build -t gcr.io/kip-ai/rnn:$VERSION -f Dockerfiles/rnn.Dockerfile .
docker build -t gcr.io/kip-ai/picstitch:$VERSION -f Dockerfiles/picstitch.Dockerfile .

gcloud docker push gcr.io/kip-ai/slack:$VERSION
gcloud docker push gcr.io/kip-ai/reply:$VERSION
gcloud docker push gcr.io/kip-ai/parser:$VERSION
gcloud docker push gcr.io/kip-ai/rnn:$VERSION
gcloud docker push gcr.io/kip-ai/picstitch:$VERSION

kubectl run slack --port=8000 --port=4343 --port=27017 --image=gcr.io/kip-ai/slack:$VERSION
kubectl run reply --port=8000 --port=4343 --port=27017 --image=gcr.io/kip-ai/reply:$VERSION
kubectl run parser --port=8083 --image=gcr.io/kip-ai/parser:$VERSION
kubectl run rnn --port=8085 --image=gcr.io/kip-ai/rnn:$VERSION
kubectl run picstitch --port=5000 --image=gcr.io/kip-ai/image:$VERSION

kubectl expose deployment slack --type=LoadBalancer
kubectl expose deployment reply --type=LoadBalancer
kubectl expose deployment parser --type=LoadBalancer
kubectl expose deployment rnn --type=LoadBalancer
kubectl expose deployment picstitch --type=LoadBalancer

# kubectl delete deployment image parser reply rnn slack

# slack build push
docker build -t gcr.io/kip-ai/slack:$VERSION -f Dockerfiles/slack.Dockerfile .
gcloud docker push gcr.io/kip-ai/slack:$VERSION
kubectl run slack --port=8000 --image=gcr.io/kip-ai/slack:$VERSION

#reply logic build push
docker build -t gcr.io/kip-ai/reply:$VERSION -f Dockerfiles/reply_logic.Dockerfile .
gcloud docker push gcr.io/kip-ai/reply:$VERSION
kubectl run reply --image=gcr.io/kip-ai/reply:$VERSION

#parser
docker build -t gcr.io/kip-ai/parser:$VERSION -f Dockerfiles/parser.Dockerfile .
gcloud docker push gcr.io/kip-ai/parser:$VERSION
kubectl run parser --port=8083 --image=gcr.io/kip-ai/parser:$VERSION
