FROM python:2.7.10-onbuild
MAINTAINER Interface Foundry <hello@interfacefoundry.com>

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev unzip
RUN apt-get install -y python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev

RUN wget https://github.com/Itseez/opencv/archive/3.0.0.zip
RUN unzip 3.0.0.zip
WORKDIR /usr/src/app/opencv-3.0.0
RUN mkdir release
WORKDIR /usr/src/app/opencv-3.0.0/release
RUN cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local ..
RUN make
RUN make install

CMD [ "python", "webserver.py" ]

