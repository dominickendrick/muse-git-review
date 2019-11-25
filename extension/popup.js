import "babel-polyfill";

import * as React from 'react';
import ReactDOM from 'react-dom';

import { MuseClient } from 'muse-js';
import { epoch, fft, powerByBand } from "@neurosity/pipes";
import { map } from 'rxjs/operators';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';

const muse = new MuseClient();

let button = document.createElement("button");

button.textContent = "Connect";
button.addEventListener("click", connect);
document.body.appendChild(button);

async function connect () {
  await muse.connect();
  console.log("connecting")
  await muse.start();
  console.log("starting")
  stream();
}

function stream () {
  console.log("streaming");
  const chart = createChart();
  muse.eegReadings
  .pipe(
    map(data => {    
      return {
        data: data.samples,
        timestamp: data.timestamp
      }
    }),
    epoch({ duration: 256, interval: 10 }),
    fft({ bins: 256 }),
    powerByBand()
  ).subscribe(powerByBand => {
      streamDataToChart(chart, powerByBand);
      console.log(powerByBand)
  });
}

class ChartComponent extends React.PureComponent {
  render() {
    return (
      <div>
        <div>Wats!</div>
        <SmoothieComponent
          responsive
          height={300}
          series={this.props.chartdata}
        />
      </div>
    );
  }
}

function createChart() {
  const data = ["alpha", "beta", "delta", "gamma", "theta"]
  let chart = document.createElement('div');
  chart.id = 'chart'
  document.body.appendChild(chart);

  const chartData = data.map(key => {
    const timeseries = new TimeSeries({ strokeStyle:'rgb(0, 255, 0)', fillStyle:'rgba(0, 255, 0, 0.4)', lineWidth:3 });
    return {
      data: timeseries,
      key
    };
  })
  

  
  ReactDOM.render(<ChartComponent chartdata={chartData} />, document.getElementById('chart'));
  // this returns an array of timeseries
  return chartData;
}

function streamDataToChart(timeseriesArray, headsetData) {
// data is this shape
// {
//   alpha: (12) [21.666848179300633, 32.62758060799881, 25.504384004672318, 24.12256947550445, 16.621530515982723, 16.099089389825778, 19.325556971147112, 30.13385676498906, 20.325770616744553, 37.756703485039154, 17.407757439949723, 26.780977378713818]
// beta: (12) [65.08096911788218, 63.296951068738196, 61.670451013659736, 65.00699204795592, 71.77595605510042, 65.89940427810012, 70.1968829194756, 60.20270786926632, 70.39684246753666, 62.00315489007533, 72.62398965780334, 68.80516475769701]
// delta: (12) [52.34518409715555, 34.21949037428681, 47.51447258680627, 38.12244824868266, 51.9699288031456, 38.46283502277925, 44.59084342358854, 43.744490545093164, 45.77309937674148, 42.62451544549633, 49.537772008516484, 42.89326937808781]
// gamma: (12) [46.76476652065696, 49.33008605215278, 51.538560192415645, 50.087718714685955, 47.7311393213173, 45.41306836565983, 50.27313023490709, 50.52398102478056, 50.30673409112451, 51.763740104864105, 46.85671058151335, 52.41741116582705]
// theta: (12) [29.90716555810569, 30.49425618141487, 46.864066239177056, 32.18797
// }
  // Data

  timeseriesArray.forEach(({key, data:timeseries }) => {
    console.log(headsetData)
    const mergedData = average(headsetData[key])
    console.log(mergedData)
    timeseries.append(Date.now(), mergedData);
  });

}

function average(arr) {
  const sum = arr.reduce(function(a, b) { return a + b; });
  return sum / arr.length;
}