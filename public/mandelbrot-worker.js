self.onmessage = (event) => {
    const {
        width,
        height,
        realSet,
        imaginarySet,
        color,
        maxIteration,
        renderId
    } = event.data

    const pixels = new Uint8ClampedArray(width * height * 4)
    const realScale = (realSet.max - realSet.min) / width
    const imaginaryScale = (imaginarySet.max - imaginarySet.min) / height

    for (let y = 0; y < height; y++) {
        const imaginary = imaginarySet.min + y * imaginaryScale

        for (let x = 0; x < width; x++) {
            const real = realSet.min + x * realScale
            const [iteration, isInMandelbrotSet] = mandelbrot(real, imaginary, maxIteration)
            const pixelIndex = (y * width + x) * 4
            const colorValue = isInMandelbrotSet ? [0, 0, 0] : getColor(color, iteration)

            pixels[pixelIndex] = colorValue[0]
            pixels[pixelIndex + 1] = colorValue[1]
            pixels[pixelIndex + 2] = colorValue[2]
            pixels[pixelIndex + 3] = 255
        }
    }

    self.postMessage({
        renderId,
        width,
        height,
        pixels: pixels.buffer
    }, [pixels.buffer])
}

function mandelbrot(real, imaginary, maxIteration) {
    let zReal = 0
    let zImaginary = 0
    let iteration = 0

    while (zReal * zReal + zImaginary * zImaginary <= 4 && iteration < maxIteration) {
        const nextReal = zReal * zReal - zImaginary * zImaginary + real
        zImaginary = 2 * zReal * zImaginary + imaginary
        zReal = nextReal
        iteration += 1
    }

    return [iteration, zReal * zReal + zImaginary * zImaginary <= 4]
}

function getColor(color, iteration) {
    const normalized = Math.max(1, iteration / 3)

    switch (color) {
        case 'red':
            return [clampColor(255 / normalized), clampColor(normalized), clampColor(normalized)]
        case 'green':
            return [clampColor(normalized), clampColor(255 / normalized), clampColor(normalized)]
        case 'blue':
            return [clampColor(normalized), clampColor(normalized), clampColor(255 / normalized)]
        case 'yellow':
            return [clampColor(255 / normalized), clampColor(255 / normalized), clampColor(normalized)]
        case 'orange':
            return [clampColor(255 / normalized), clampColor(165 / normalized), clampColor(normalized)]
        case 'purple':
            return [clampColor(128 / normalized), clampColor(normalized), clampColor(128 / normalized)]
        case 'pink':
            return [clampColor(255 / normalized), clampColor(192 / normalized), clampColor(203 / normalized)]
        case 'brown':
            return [clampColor(165 / normalized), clampColor(42 / normalized), clampColor(42 / normalized)]
        case 'cyan':
            return [clampColor(normalized), clampColor(255 / normalized), clampColor(255 / normalized)]
        default:
            return [clampColor(normalized), clampColor(normalized), clampColor(255 / normalized)]
    }
}

function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)))
}
