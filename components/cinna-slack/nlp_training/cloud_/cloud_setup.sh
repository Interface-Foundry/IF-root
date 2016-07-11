#! /bin/sh
# cloud setup on google cpu
# Created Jul 8, 2016

# equivalent command line
# gcloud compute --project "kip-ai" instances create "nlp-train1" --zone "us-central1-a" --machine-type "custom-8-16384" --network "default" --metadata "ssh-keys=graham:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDAlPe1d3QiQgNeRNG0tqHIzhCe6SQm3VGruK+LObc51reidCbcO5OkbIhYtyiQZCLa8rJ5W1UD0dFRuVChspIm1HhuNz0CBKCjwdDwbccSUrc+sDUeO9H3y9pGnfenfOW6WAFkcIPkKRA94Y1z6bCeQ74/FJetqJZdVFnPzYApcVuno1DS4QKeOABS5A6yp5Xr+fsAyhZNZcz3dBd7Rr7zLwqJ0HJYbuk+e6HA2Y59Sae5j8vFkZHH5wWk/BPszscjZ/pSed+U6qT02mxx7XSF5q6krCjnxk7b8OKo0hNDZJo2ULt2UvHq9+cQ7d1XHqCbNhHYQeBgkFliO2srdFWt graham@Grahams-MacBook-Pro.local" --maintenance-policy "MIGRATE" --scopes default="https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring.write","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management" --image "/ubuntu-os-cloud/ubuntu-1604-xenial-v20160627" --boot-disk-size "100" --boot-disk-type "pd-standard" --boot-disk-device-name "nlp-train1"

# ------------------------------------------------------------------------------
#  Initial installs and setup
apt update && apt install -y mongodb unzip tmux python3 python3-dev python3-numpy python3-pip python3-software-properties nodejs npm

ln -s /usr/bin/nodejs /usr/bin/node

# ------------------------------------------------------------------------------
# Python3 Installs
# install nltk and spacy corpus

export TF_BINARY_URL=https://storage.googleapis.com/tensorflow/linux/cpu/tensorflow-0.9.0-cp35-cp35m-linux_x86_64.whl

sudo pip3 install --upgrade $TF_BINARY_URL pandas flask keras pymongo h5py nltk spacy && \
    python3 -m textblob.download_corpora &&  \
    python3 -m spacy.en.download all

# set up keras
echo '{"epsilon": 1e-07, "floatx": "float32", "backend": "tensorflow"}' > ~/.keras/keras.json

# ------------------------------------------------------------------------------
# personal configs

# tmux necessary for training persistently
cp tmux.conf ~/.tmux.conf


# ------------------------------------------------------------------------------
# Google Cloud SDK setup
# Create an environment variable for the correct distribution
export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)"

# Add the Cloud SDK distribution URI as a package source
echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list

# Import the Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

# Update and install the Cloud SDK
sudo apt-get update && sudo apt-get install google-cloud-sdk

# Run gcloud init to get started
gcloud init

# ------------------------------------------------------------------------------
git clone https://github.com/Kaixhin/FGLab.git && cd FGLab && npm install && bower install


echo -e 'MONGODB_URI=mongodb://localhost:27017/FGLab\nFGLAB_PORT=5080' >> .env
