const imageUploader = document.getElementById("imageUploader")
const inputImage = document.getElementById("inputImage")
const video = document.getElementById("video")
const startCameraButton = document.getElementById("startCameraButton")
const stopCameraButton = document.getElementById("stopCameraButton")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const ascii = document.getElementById("ascii")

let streaming = false

ctx.scale(-1, 1);
ctx.font = '48px serif';
ctx.fillText('Hello world!', -280, 90);

imageUploader.onchange = event => {
    inputImage.src = URL.createObjectURL(event.target.files[0])
    inputImage.onload = () => {
        URL.revokeObjectURL(inputImage.src) // free memory

        const size = 2

        let imageData = getImageDataFromImage(inputImage, inputImage.width, inputImage.height)

        ctx.scale(-1, 1)
        ctx.putImageData(imageData, 0, 0)

        const text = convertImageDataToASCII(imageData, size)
        ascii.innerHTML = text
    }
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then( stream => {
        video.srcObject = stream
        video.play()
        streaming = true
        setTimeout(timerCallback, 2000)
    })
    .catch( error => {
        alert("Det har oppstått en feil: " + error)
    })
}

function stopCamera() {
    video.srcObject.getTracks().forEach(function(track) {
        track.stop()
    })
    streaming = false
}

startCameraButton.onclick = startCamera
stopCameraButton.onclick = stopCamera

function timerCallback() {
    if (!streaming) {
        return;
    }
    const imageData = getImageDataFromImage(video, video.videoWidth, video.videoHeight)
    const text = convertImageDataToASCII(imageData, 10)
    ascii.innerHTML = text
    setTimeout(() => {
        timerCallback();
    }, 0);
  };

video.addEventListener("play", () => {
    console.log("test")
})
