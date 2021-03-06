'use strict';
const ReconnectingWebSocket = require('./ReconnectingWebSocket.js');
const { show, hide } = require('./dom');
const makeStore = require('./store');

module.exports = function participantView(root, storage) {
  const socket = new ReconnectingWebSocket('ws://localhost:3000');
  socket.addEventListener('message', (event) => {
    let decodedMessage = JSON.parse(event.data);
    if (decodedMessage.type === 'registered') {
      storage.setItem('user_id', decodedMessage.user_id);
      storage.setItem('user_name', decodedMessage.user_name);
      storage.setItem('user_group', decodedMessage.user_group);
    }
  })
  const store = makeStore({
    error: null,
    isRegistered: (
      Boolean(storage.getItem('user_id')) &&
      Boolean(storage.getItem('user_name')) &&
      Boolean(storage.getItem('user_group'))
    ),
    isConnected: false
  });
  store.addListener(render);

  function register(formValues) {
    let message = JSON.stringify({
      "type": "register",
      "user_name": formValues.user_name,
      "user_group": formValues.user_group,
    });
    socket.send(message);
    // TODO: Connect to the server, ask for a new user ID, then bind to the obtained ID.
    // Finally, when done, save the user ID, name and group.
    // console.log('register: not implemented');
    // storage.setItem('user_id', TODO);
    // storage.setItem('user_name', formValues.user_name);
    // storage.setItem('user_group', formValues.user_group);
    return Promise.resolve();
  }

  function handleUserRegistration(event) {
    event.preventDefault();
    const registrationForm = event.target;
    const registrationData = new FormData(registrationForm);
    const formValues = {
      user_name: registrationData.get('user_name'),
      user_group: Number(registrationData.get('user_group'))
    };
    if (formValues.user_name && formValues.user_group) {
      register(formValues).then(function() {
        store.update({ isRegistered: true });
      });
    } else {
      store.update({ error: new Error('Missing data in registration form') });
    }
  }

  function handleTrainerSummoningStart(event) {
    event.preventDefault();
    // TODO: Send a message over WebSocket to ask a trainer for support.
    // TODO: Update state locally after successfully asking, or alternatively
    //  use event-based updates and do nothing until an event arrives.
    // TODO: Debounce repeated clicks when the request is still in flight.
    console.log('handleTrainerSummoningStart: not implemented');
  }

  function handleTrainerSummoningCancel(event) {
    event.preventDefault();
    // TODO: Send a message over WebSocket to cancel your support request.
    // TODO: Update state locally after cancelling - either on receipt of
    //  command acknowledgement if doing RPC style, or on event.
    // TODO: Debounce repeated clicks when the request is still in flight.
    console.log('handleTrainerSummoningCancel: not implemented');
  }

  function render(state) {
    if (state.error) {
      // TODO: Display the error to the user in a visible place.
      console.error(state.error);
    }
    const registrationSection = root.querySelector('.user_registration');
    const registrationForm = registrationSection.querySelector('form');
    const disconnectedSection = root.querySelector('.disconnected_warning');
    const controlSection = root.querySelector('.participant_controls');
    const summoningButton = controlSection.querySelector('button.start');
    const cancelButton = controlSection.querySelector('button.stop');
    if (state.isRegistered) {
      hide(registrationSection);
      show(controlSection);
    } else {
      show(registrationSection);
      hide(controlSection);
    }
    if (state.isConnected) {
      hide(disconnectedSection);
    } else {
      show(disconnectedSection);
    }
    // TODO: Enable/disable the appropriate buttons based on:
    // * connection state (all disabled - wait for connection)
    // * current summoning activity (only allow start when not started already)

    registrationForm.addEventListener('submit', handleUserRegistration);
    summoningButton.addEventListener('click', handleTrainerSummoningStart);
    cancelButton.addEventListener('click', handleTrainerSummoningCancel);
  }

  // TODO: Listen for notifications that indicate:
  // * that a trainer has been requested (during our previous connection?)
  // * that a trainer has acknowledged the request and is coming
  // * that a trainer has cancelled their acknowledgement and will not come
  // * that our help request has been fulfilled (this can be indicated by the trainer)
  // Upon receiving these, the view should update.

  store.init();
};
