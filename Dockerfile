FROM node:12.16-alpine

COPY . /mandelbrot
WORKDIR /mandelbrot/server/

ENV HOST="0.0.0.0"
ENV PORT="8000"

EXPOSE $PORT

RUN npm install express -g

CMD ["npm", "start"]
