FROM google/cloud-sdk:latest
RUN apt-get update -y && \
    apt-get install -y mongodb
ADD bin/db_backup.sh /db_backup.sh
RUN mkdir /backups/ && mv /db_backup.sh /backups/db_backup.sh && chmod +x /backups/db_backup.sh
WORKDIR /backups/
CMD "./db_backup.sh"