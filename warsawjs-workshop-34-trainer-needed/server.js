'use strict';

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const colors = require('colors');
const fs = require('fs');
const WebSocket = require('ws');
const uuidv4 = require('uuid/v4');

const server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist')));

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    let decodedMessage = JSON.parse(message);
    let response = 'wrong type name'
    switch (decodedMessage.type) {
      case 'register':
          response = {
            'type': 'registered',
            'user_name': decodedMessage.user_name,
            'user_group': decodedMessage.user_group,
            'user_id': uuidv4(),
          }
        break;
    
      default:
        break;
    }
    ws.send(JSON.stringify(response));
  });
});

server.listen(3000);
