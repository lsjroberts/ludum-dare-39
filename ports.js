'use strict';

const app = Elm.Main.embed(container);

const messagingSound = new Audio('messaging.wav');

app.ports.playMessagingSound.subscribe(() => {
  messagingSound.play();
});