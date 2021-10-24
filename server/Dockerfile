FROM word-detective-bins:v0.1 as binaries

WORKDIR /word-detective-server

RUN apk add --update --no-cache \
python3 \
nodejs \
npm \
py-pip \
bash \
vim

RUN pip install jinja2

COPY package.json /word-detective-server/
RUN npm install

COPY . /word-detective-server/

RUN ln /word-detective/install/app/word-detective /word-detective-server/bin/word-detective
RUN ln /word-detective/install/app/export-brick /word-detective-server/bin/export-brick
RUN ln /word-detective/install/render-word-detective/render-word-detective.py /word-detective-server/bin/render-word-detective.py

RUN ./conf/scripts/init-server.sh

# ENTRYPOINT [ "node","init.js" ]
