VERSION=0.7.4.7 

kubectl run replylogic --image=gcr.io/kip-styles/reply_logic:$VERSION
kubectl run web --image=gcr.io/kip-styles/web:$VERSION --port=8000
kubectl run facebook --image=gcr.io/kip-styles/facebook:$VERSION --port=4343
kubectl run nlp --image=gcr.io/kip-styles/nlp:$VERSION --port=8083
kubectl run picstitch --image=gcr.io/kip-styles/picstitch:$VERSION --port=5000

kubectl expose deployment web --type="LoadBalancer"
kubectl expose deployment facebook --type="LoadBalancer"
kubectl expose deployment nlp
kubectl expose deployment picstitch
