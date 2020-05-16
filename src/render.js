//Buttons
const videoElement = document.querySelector("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;
const { desktopCapturer, remote } = require("electron");
const { Menu } = remote;
//Get the available video sources

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
  videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

//Change the videoSource window to record
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };
  //Create a stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //Preview the source in a video element

  videoElement.srcObject = stream;
  videoElement.play();

  //Create the Media Recorder
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new mediaRecorder(stream, options);

  //Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
  console.log("video data available");
  recorderChunks.push(e.data);
}

const { dialog } = remote;

const {writefile} = require('fs')

//Saves the video file on Stop
async function handleStop(e) {
  const blob = new Blob(recorderChunks, {
    type: "video/webm; codecs = vp9",
  });
  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: "vid-${Date.now()}.webm",
  });

  console.log(filePath);
  writefile(filePath,buffer,()=>console.log('Video saved Successfully!'))
}
