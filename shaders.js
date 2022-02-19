function map(value, minInput, maxInput, minOutput, maxOutput) {
    return (maxOutput - minOutput)*(value - minInput) / (maxInput - minInput) + minOutput
}

function getImageDataFromImage(image, width, height) {
    // Create temporary canvas object
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = width
    canvas.height = height

    // Draw image on canvas and return pixel data
    ctx.drawImage(image, 0, 0, width, height)
    return ctx.getImageData(0, 0, width, height)
}

function pixelateImageData(imageData, downgradeLevel) {
    
    // Remove pixels from the edges so that the image size is congruent modulo downgradeLevel
    // This makes it easier to work with the image
    const newWidth = imageData.width - imageData.width%downgradeLevel
    const newHeight = imageData.height - imageData.height%downgradeLevel

    // Create temporary canvas object
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = imageData.width
    canvas.height = imageData.height

    // Draw image on canvas and get pixel data
    ctx.putImageData(imageData, 0, 0)
    imageData = ctx.getImageData(0, 0, newWidth, newHeight)

    // Loop through every chunk in the image
    for (let y = 0; y < newHeight; y+=downgradeLevel) {
        for (let x = 0; x < newWidth; x+=downgradeLevel) {
            const chunkIndex = (newWidth*y + x)*4

            let r = g = b = 0

            // Sum together all pixel values in chunk
            for (let y2 = 0; y2 < downgradeLevel; y2++) {
                for (let x2 = 0; x2 < downgradeLevel; x2++) {
                    const pixelOffset = (y2*newWidth + x2)*4
                    const pixelIndex = chunkIndex + pixelOffset
                    r += imageData.data[pixelIndex]
                    g += imageData.data[pixelIndex+1]
                    b += imageData.data[pixelIndex+2]
                }
            }

            // Calculate average pixel color            
            r = Math.round(r/(downgradeLevel**2))
            g = Math.round(g/(downgradeLevel**2))
            b = Math.round(b/(downgradeLevel**2))

            // Color all pixels in chunk with same color
            for (let y2 = 0; y2 < downgradeLevel; y2++) {
                for (let x2 = 0; x2 < downgradeLevel; x2++) {
                    const pixelOffset = (y2*newWidth + x2)*4
                    const pixelIndex = chunkIndex + pixelOffset
                    imageData.data[pixelIndex] = r
                    imageData.data[pixelIndex+1] = g
                    imageData.data[pixelIndex+2] = b
                }
            }
        }
    }
    return imageData
}

function grayscaleImageData(imageData) {
    for (let i = 0; i < imageData.data.length; i+=4) {
        const average = Math.round((imageData.data[i] + imageData.data[i+1] + imageData.data[i+2])/3)
        imageData.data[i] = average
        imageData.data[i+1] = average
        imageData.data[i+2] = average
    }
}

function convertImageDataToASCII(imageData, pixelsPerCharacter, reverse = false) {
    
    let brightness = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
    if (reverse) {
        brightness = brightness.split("").reverse().join("")
    }

    imageData = pixelateImageData(imageData, pixelsPerCharacter)

    let text = ""

    for (let y = 0; y < imageData.height; y+=pixelsPerCharacter) {
        for (let x = 0; x < imageData.width; x+=pixelsPerCharacter) {
            const pixelindex = (y*imageData.width + x)*4
            const rgbAverage = Math.round((imageData.data[pixelindex] + imageData.data[pixelindex+1] + imageData.data[pixelindex+2])/3)
            const character = brightness[Math.round(map(rgbAverage, 0, 255, 0, brightness.length-1))]
            text += "<span style='color: rgb(" + imageData.data[pixelindex] + "," + imageData.data[pixelindex+1] + "," + imageData.data[pixelindex+2] + ")'>" + character + character + "</span>"
        }
        text += "\n"
    }
    return text
}