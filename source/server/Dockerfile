FROM word-detective-bins:v0.1

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

RUN ln /word-detective/bin/app/word-detective /word-detective-server/bin/word-detective
RUN ln /word-detective/bin/app/export-brick /word-detective-server/bin/export-brick
RUN ln /word-detective/bin/render-word-detective/render-word-detective.py /word-detective-server/bin/render-word-detective.py
RUN ln /word-detective/bin/word-detective-js/word-detective-min.js /word-detective-server/assets/public/js/word-detective-min.js
RUN ln /word-detective/bin/italian_dictionary.py /word-detective-server/bin/italian_dictionary.py
RUN ln /word-detective/bin/chatgpt_dictionary.py /word-detective-server/bin/chatgpt_dictionary.py

ENTRYPOINT [ "conf/scripts/init-server.sh" ]
