import { zipSamples, channelNames, MuseClient } from "muse-js";
import { EEGReading } from "muse-js/dist/lib/muse-interfaces.d.ts";
import { removeChannels, powerByBand, epoch, fft } from "@neurosity/pipes";

let client: MuseClient = new MuseClient();

function connectToolbar() {
  let container = document.createElement("div");
  container.id = ("muse-toolbar")

  let button = document.createElement("button")
  button.textContent = "Enable mind control!";
  button.classList.add("btn", "btn-sm", "btn-primary", "float-left", "mr-1")
  button.type = "submit"
  button.addEventListener("click", connect);

  container.appendChild(button)

  return container;
}


async function connect () {
  await client.connect();
  await client.start();
  hideToolbar();
  stream();
}

function hideToolbar() {
  const toolbar = document.getElementById("muse-toolbar")
  toolbar.classList.add("hidden");
}

function stream () {
  zipSamples(client.eegReadings)
    .pipe(
      epoch({ duration: 1024, interval: 100, samplingRate: 256 }),
      fft({ bins: 256 }),
      powerByBand()
    )
    .subscribe( (eeg: EEGReading) => { console.log(eeg) });
}

let reviewForm = document.querySelector("#submit-review div.form-actions")

document.body.appendChild(connectToolbar());