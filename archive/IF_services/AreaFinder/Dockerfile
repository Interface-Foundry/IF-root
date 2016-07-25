FROM python:2.7.10-onbuild
MAINTAINER Interface Foundry <hello@interfacefoundry.com>

RUN apt-get update && apt-get install -y \
    libgdal1h \
    libgdal1-dev

# gdal is super annoying
RUN pip install pygdal==$(gdal-config --version)

EXPOSE 9998

CMD [ "python", "findarea.py" ]

