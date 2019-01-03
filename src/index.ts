import { MuseClient } from "muse-js";
import { EEGReading } from "muse-js/dist/lib/muse-interfaces.d.ts";


let client: MuseClient = new MuseClient();

function connectButton() {
  let button = document.createElement("button");
  button.textContent = "Connect";
  button.addEventListener("click", connect);

  return button;
}

function pauseButton() {
  let button = document.createElement("button");
  button.textContent = "Pause";
  button.addEventListener("click", pause);

  return button;
}


async function connect () {
  await client.connect();
  await client.start();
  stream();
}

async function pause () {
  await client.pause();
}

function stream () {
  client.eegReadings
    .subscribe( (eeg: EEGReading) => { console.log(eeg) });
}

document.body.appendChild(connectButton());
document.body.appendChild(pauseButton());