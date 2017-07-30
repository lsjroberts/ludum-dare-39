'use strict';

const app = Elm.Main.embed(container);

const messagingSound = new Audio('messaging.wav');
messagingSound.volume = 0.3;

app.ports.playMessagingSound.subscribe(() => {
  messagingSound.play();
});