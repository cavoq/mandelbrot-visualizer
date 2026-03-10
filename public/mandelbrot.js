let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let downloadButton = document.getElementById('download-button')
let generateButton = document.getElementById('generate-button')
let resetButton = document.getElementById('reset-button')
let currentColor = document.getElementById('color-select')

ctx.canvas.width = window.innerWidth / 1.5
ctx.canvas.height = window.innerHeight / 1.5

let MAX_ITERATION = 150

const DEFAULT_REAL_SET = { min: -2, max: 1 }
const DEFAULT_IMAGINARY_SET = { min: -1, max: 1 }
const ZOOM_STEP = 0.8

let realSet = { ...DEFAULT_REAL_SET }
let imaginarySet = { ...DEFAULT_IMAGINARY_SET }
let renderFrame = null

function mandelbrot(real, imaginary) {
    let zReal = 0
    let zImaginary = 0
    let iteration = 0

    while (zReal * zReal + zImaginary * zImaginary <= 4 && iteration < MAX_ITERATION) {
        const nextReal = zReal * zReal - zImaginary * zImaginary + real
        zImaginary = 2 * zReal * zImaginary + imaginary
        zReal = nextReal
        iteration += 1
    }

    return [iteration, zReal * zReal + zImaginary * zImaginary <= 4]
}

function draw(canvas, color) {
    const image = ctx.createImageData(canvas.width, canvas.height)
    const pixels = image.data
    const realScale = (realSet.max - realSet.min) / canvas.width
    const imaginaryScale = (imaginarySet.max - imaginarySet.min) / canvas.height

    for (let y = 0; y < canvas.height; y++) {
        const imaginary = imaginarySet.min + y * imaginaryScale

        for (let x = 0; x < canvas.width; x++) {
            const real = realSet.min + x * realScale
            const [iteration, isInMandelbrotSet] = mandelbrot(real, imaginary)
            const pixelIndex = (y * canvas.width + x) * 4
            const colorValue = isInMandelbrotSet ? [0, 0, 0] : getColor(color, iteration)

            pixels[pixelIndex] = colorValue[0]
            pixels[pixelIndex + 1] = colorValue[1]
            pixels[pixelIndex + 2] = colorValue[2]
            pixels[pixelIndex + 3] = 255
        }
    }

    ctx.putImageData(image, 0, 0)
}

function getColor(color, m) {
    const normalized = Math.max(1, m / 3)

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

function render() {
    renderFrame = null
    draw(canvas, currentColor.value)
}

function scheduleRender() {
    if (renderFrame !== null) {
        return
    }

    renderFrame = window.requestAnimationFrame(() => {
        render()
    })
}

function getComplexCoordinate(x, y) {
    return {
        real: realSet.min + (x / canvas.width) * (realSet.max - realSet.min),
        imaginary: imaginarySet.min + (y / canvas.height) * (imaginarySet.max - imaginarySet.min)
    }
}

function zoomAtPoint(x, y, factor) {
    const point = getComplexCoordinate(x, y)
    const realRange = (realSet.max - realSet.min) * factor
    const imaginaryRange = (imaginarySet.max - imaginarySet.min) * factor

    realSet = {
        min: point.real - realRange / 2,
        max: point.real + realRange / 2
    }

    imaginarySet = {
        min: point.imaginary - imaginaryRange / 2,
        max: point.imaginary + imaginaryRange / 2
    }

    scheduleRender()
}

function resetView() {
    realSet = { ...DEFAULT_REAL_SET }
    imaginarySet = { ...DEFAULT_IMAGINARY_SET }
    scheduleRender()
}

window.addEventListener('resize', () => {
    ctx.canvas.height = window.innerHeight / 1.5
    ctx.canvas.width = window.innerWidth / 1.5
    scheduleRender()
});

downloadButton.addEventListener('click', () => {
    const data = canvas.toDataURL('image/jpeg')
    const link = document.createElement('a')
    link.href = data
    link.download = 'mandelbrot.jpg'
    link.click()
})

generateButton.addEventListener('click', () => {
    scheduleRender()
})

resetButton.addEventListener('click', () => {
    resetView()
})

canvas.addEventListener('wheel', (event) => {
    event.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, factor)
}, { passive: false })
