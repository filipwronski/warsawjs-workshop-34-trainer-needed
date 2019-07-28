'use strict';

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const colors = require('colors');
const fs = require('fs');
const WebSocket = require('ws');


const server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist')));

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

server.listen(3000);
