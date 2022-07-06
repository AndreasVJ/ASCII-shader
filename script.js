const imageUploader = document.getElementById("imageUploader")
const inputImage = document.getElementById("inputImage")
const video = document.getElementById("video")
const cameraButton = document.getElementById("cameraButton")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const ascii = document.getElementById("ascii")
const resolutionSlider = document.getElementById("resolutionSlider")
const resolutionSliderText = document.getElementById("resolutionSliderText")


resolutionSliderText.innerText = "Pixelation: " + resolutionSlider.value
resolutionSlider.oninput = () => {
    resolutionSliderText.innerText = "Pixelation: " + resolutionSlider.value
}

let streaming = false

imageUploader.onchange = event => {

    stopCamera()
    cameraButton.onclick = startCamera

    ascii.classList.remove("flipHorizontally")

    inputImage.src = URL.createObjectURL(event.target.files[0])
    inputImage.onload = () => {
        URL.revokeObjectURL(inputImage.src) // free memory

        const imageData = getImageDataFromImage(inputImage, inputImage.width, inputImage.height)

        const text = convertImageDataToASCII(imageData, parseInt(resolutionSlider.value))
        ascii.style.fontSize = window.innerHeight*0.7 / (inputImage.height / resolutionSlider.value) + "px"
        ascii.innerHTML = text
    }
}

function startCamera() {

    cameraButton.onclick = stopCamera

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then( stream => {
        video.srcObject = stream
        video.msHorizontalMirror = true;
        video.play()
        streaming = true
    })
    .catch( error => {
        alert("An error has occurred: " + error)
    })
}

function stopCamera() {

    cameraButton.onclick = startCamera

    video.srcObject.getTracks().forEach(function(track) {
        track.stop()
    })
    streaming = false
}

cameraButton.onclick = startCamera

function timerCallback() {
    if (!streaming) {
        return;
    }
    if (video.videoWidth != 0) {
        const imageData = getImageDataFromImage(video, video.videoWidth, video.videoHeight)
        const text = convertImageDataToASCII(imageData, parseInt(resolutionSlider.value))
        ascii.style.fontSize = window.innerHeight*0.7 / (video.videoHeight / resolutionSlider.value) + "px"
        ascii.innerHTML = text
    }
    setTimeout(() => {
        timerCallback()
    }, 0)
}

video.addEventListener("play", () => {
    timerCallback()
    ascii.classList.add("flipHorizontally")
})
