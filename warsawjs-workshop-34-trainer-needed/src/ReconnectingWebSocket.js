'use strict';

import EventEmitter from 'eventemitter2';

class ReconnectingWebSocket extends EventEmitter {
   constructor(websocketUrl) {
        super();
        this.websocketUrl = websocketUrl;
        this.start();
    }

    addEventListener(...args) {
      return this.addListener(...args);
    }

    start() {
        this.socket = new WebSocket(this.websocketUrl);
        this.socket.addEventListener('open', (event) => {
          this.emit('open');
        });

        this.socket.addEventListener('message', (event) => {
          this.emit('message', event);
        });

        this.socket.addEventListener('error', () => {
          this.emit('error');
        });

        this.socket.addEventListener('close', () => {
          console.log('close');
          setTimeout(() => {
            this.start();
          }, 5000);
        });

        this.socket.addEventListener('open', () => {
          this.emit('open');
        })
    };

    send(message) {
        this.socket.send(message);
    }
}

export default ReconnectingWebSocket;