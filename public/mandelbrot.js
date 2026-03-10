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
let renderSequence = 0
let activeRenderId = 0
let renderInFlight = false
let pendingRender = false
let isDragging = false
let dragStart = null
let dragStartRealSet = null
let dragStartImaginarySet = null

const renderWorker = new Worker('mandelbrot-worker.js')

renderWorker.onmessage = (event) => {
    const { renderId, width, height, pixels } = event.data

    renderInFlight = false

    if (renderId === activeRenderId) {
        const image = new ImageData(new Uint8ClampedArray(pixels), width, height)
        ctx.putImageData(image, 0, 0)
    }

    if (pendingRender) {
        pendingRender = false
        render()
    }
}

function render() {
    renderFrame = null
    if (renderInFlight) {
        pendingRender = true
        return
    }

    const renderId = ++renderSequence
    activeRenderId = renderId
    renderInFlight = true

    renderWorker.postMessage({
        renderId,
        width: canvas.width,
        height: canvas.height,
        realSet,
        imaginarySet,
        color: currentColor.value,
        maxIteration: MAX_ITERATION
    })
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

function panView(deltaX, deltaY) {
    const realRange = dragStartRealSet.max - dragStartRealSet.min
    const imaginaryRange = dragStartImaginarySet.max - dragStartImaginarySet.min
    const realOffset = (deltaX / canvas.width) * realRange
    const imaginaryOffset = (deltaY / canvas.height) * imaginaryRange

    realSet = {
        min: dragStartRealSet.min - realOffset,
        max: dragStartRealSet.max - realOffset
    }

    imaginarySet = {
        min: dragStartImaginarySet.min - imaginaryOffset,
        max: dragStartImaginarySet.max - imaginaryOffset
    }

    scheduleRender()
}

window.addEventListener('resize', () => {
    ctx.canvas.height = window.innerHeight / 1.5
    ctx.canvas.width = window.innerWidth / 1.5
    scheduleRender()
})

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

currentColor.addEventListener('change', () => {
    scheduleRender()
})

canvas.addEventListener('wheel', (event) => {
    event.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, factor)
}, { passive: false })

canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        isDragging = true
        dragStart = { x: event.clientX, y: event.clientY }
        dragStartRealSet = { ...realSet }
        dragStartImaginarySet = { ...imaginarySet }
        canvas.style.cursor = 'grabbing'
    }

    if (event.button === 1) {
        event.preventDefault()
        resetView()
    }
})

canvas.addEventListener('auxclick', (event) => {
    if (event.button === 1) {
        event.preventDefault()
    }
})

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) {
        return
    }

    panView(event.clientX - dragStart.x, event.clientY - dragStart.y)
})

window.addEventListener('mouseup', () => {
    isDragging = false
    dragStart = null
    dragStartRealSet = null
    dragStartImaginarySet = null
    canvas.style.cursor = 'grab'
})

canvas.addEventListener('mouseleave', () => {
    if (!isDragging) {
        canvas.style.cursor = 'grab'
    }
})

scheduleRender()
