from gcloud import storage
import tarfile
import bson


gcloud_config = {
    'proj_name': 'kip_styles',
    'key': 'gcloud-picstitch.json',
    'bucket': 'kip-db-dump'
}

slack_tar_name = 'latest_slack_db.tar.gz'

model_training = 'cafe_suggestions'


def download_dataset():
    gcloud_client = storage.Client(project=gcloud_config['proj_name'])
    db_bucket = gcloud_client.get_bucket(gcloud_config['bucket'])
    slack_file = list(db_bucket.list_blobs(prefix='latest/slack'))[0]
    slack_file.download_to_filename(slack_tar_name)


def untar_db():
    tar = tarfile.open(slack_tar_name)
    tar.extractall()


def read_prefernces():
    preferences = open('foundry/preferencesfile.bson', 'rb').read()
    return bson.loads(preferences.read())


def read_users():
    chatusers = open('foundry/chatusers.bson', 'rb').read()
    return bson.loads(chatusers.read())



def