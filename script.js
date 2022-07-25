const file = document.getElementById("file")
const fileName = document.getElementById("fileName")
const inputImage = document.getElementById("inputImage")
const video = document.getElementById("video")
const cameraButton = document.getElementById("cameraButton")
const cameraButtonInside = document.getElementById("cameraButtonInside")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const ascii = document.getElementById("ascii")
const pixelationSlider = document.getElementById("pixelationSlider")
const pixelationSliderText = document.getElementById("pixelationSliderText")


pixelationSliderText.innerText = "Pixelation: " + pixelationSlider.value
pixelationSlider.oninput = () => {
    pixelationSliderText.innerText = "Pixelation: " + pixelationSlider.value
}

let streaming = false

file.onchange = event => {

    stopCamera()
    cameraButton.onclick = startCamera

    ascii.classList.remove("flipHorizontally")

    inputImage.src = URL.createObjectURL(event.target.files[0])
    fileName.innerText = event.target.files[0].name
    inputImage.onload = () => {
        URL.revokeObjectURL(inputImage.src) // free memory

        const imageData = getImageDataFromImage(inputImage, inputImage.width, inputImage.height)

        const text = convertImageDataToASCII(imageData, parseInt(pixelationSlider.value))
        ascii.style.fontSize = window.innerHeight*0.7 / (inputImage.height / pixelationSlider.value) + "px"
        ascii.innerHTML = text
    }
}

function startCamera() {

    cameraButton.onclick = stopCamera

    cameraButtonInside.classList.add("cameraButtonInsideRecording")

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then( stream => {
        video.srcObject = stream
        video.msHorizontalMirror = true;
        video.play()
    })
    .catch( error => {
        alert("An error has occurred: " + error)
    })
}

function stopCamera() {
    if (streaming) {
        cameraButton.onclick = startCamera
    
        cameraButtonInside.classList.remove("cameraButtonInsideRecording")
    
        video.srcObject.getTracks().forEach(function(track) {
            track.stop()
        })
        streaming = false
    }

}

cameraButton.onclick = startCamera

function timerCallback() {
    if (!streaming) {
        return;
    }
    if (video.videoWidth != 0) {
        const imageData = getImageDataFromImage(video, video.videoWidth, video.videoHeight)
        const text = convertImageDataToASCII(imageData, parseInt(pixelationSlider.value))
        ascii.style.fontSize = window.innerHeight*0.7 / (video.videoHeight / pixelationSlider.value) + "px"
        ascii.innerHTML = text
    }
    setTimeout(() => {
        timerCallback()
    }, 0)
}

video.addEventListener("play", () => {
    streaming = true
    timerCallback()
    ascii.classList.add("flipHorizontally")
})
