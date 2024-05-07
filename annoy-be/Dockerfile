FROM python:3.8-slim-buster AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install cryptography

WORKDIR /

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD ["flask", "run", "--host", "0.0.0.0" ]