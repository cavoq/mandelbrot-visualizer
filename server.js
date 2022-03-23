const express = require('express');
const app = new express();

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 8001

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/mandelbrot.html');
});

app.listen(port, host, () => {
    console.log(`listening on ${host}:${port}`);
});