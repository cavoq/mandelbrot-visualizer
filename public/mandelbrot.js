let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let downloadButton = document.getElementById('download-button')
let generateButton = document.getElementById('generate-button')
let resetButton = document.getElementById('reset-button')
let currentColor = document.getElementById('color-select')
let renderStatus = document.getElementById('render-status')
let qualityStatus = document.getElementById('quality-status')
let renderBufferCanvas = document.createElement('canvas')
let renderBufferContext = renderBufferCanvas.getContext('2d')

const BASE_MAX_ITERATION = 220
const MAX_MAX_ITERATION = 1600

const DEFAULT_REAL_SET = { min: -2, max: 1 }
const DEFAULT_IMAGINARY_SET = { min: -1, max: 1 }
const ZOOM_STEP = 0.8
const DRAG_RENDER_SCALE = 0.5
const WHEEL_SETTLE_DELAY = 120

let realSet = { ...DEFAULT_REAL_SET }
let imaginarySet = { ...DEFAULT_IMAGINARY_SET }
let renderFrame = null
let renderSequence = 0
let activeRenderId = 0
let scheduledRenderQuality = 'full'
let renderInFlight = false
let pendingRenderQuality = null
let isDragging = false
let dragStart = null
let dragStartRealSet = null
let dragStartImaginarySet = null
let wheelRenderTimeout = null

const renderWorker = new Worker('mandelbrot-worker.js')

function resizeCanvas() {
    const width = Math.min(window.innerWidth * 0.9, 980)
    const height = Math.min(window.innerHeight * 0.72, 760)
    ctx.canvas.width = Math.max(320, Math.floor(width))
    ctx.canvas.height = Math.max(240, Math.floor(height))
}

function updateRenderStatus(label, detail) {
    renderStatus.textContent = label
    qualityStatus.textContent = detail
}

function getIterationCount() {
    const defaultRealRange = DEFAULT_REAL_SET.max - DEFAULT_REAL_SET.min
    const currentRealRange = realSet.max - realSet.min
    const zoomFactor = defaultRealRange / currentRealRange
    const adaptiveIterations = Math.floor(BASE_MAX_ITERATION + Math.log2(Math.max(1, zoomFactor)) * 36)

    return Math.max(BASE_MAX_ITERATION, Math.min(MAX_MAX_ITERATION, adaptiveIterations))
}

renderWorker.onmessage = (event) => {
    const { renderId, width, height, pixels } = event.data

    renderInFlight = false

    if (renderId === activeRenderId) {
        const image = new ImageData(new Uint8ClampedArray(pixels), width, height)
        renderBufferCanvas.width = width
        renderBufferCanvas.height = height
        renderBufferContext.putImageData(image, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(renderBufferCanvas, 0, 0, canvas.width, canvas.height)
    }

    updateRenderStatus(
        'Ready',
        `${width === canvas.width ? 'Full quality' : 'Interactive preview'} · ${getIterationCount()} iterations`
    )

    if (pendingRenderQuality !== null) {
        const quality = pendingRenderQuality
        pendingRenderQuality = null
        render(quality)
    }
}

function getRenderDimensions(quality) {
    if (quality === 'drag' || quality === 'interactive') {
        return {
            width: Math.max(1, Math.floor(canvas.width * DRAG_RENDER_SCALE)),
            height: Math.max(1, Math.floor(canvas.height * DRAG_RENDER_SCALE))
        }
    }

    return {
        width: canvas.width,
        height: canvas.height
    }
}

function render(quality = 'full') {
    renderFrame = null
    if (renderInFlight) {
        pendingRenderQuality = pendingRenderQuality === 'full' || quality === 'full' ? 'full' : quality
        return
    }

    const renderId = ++renderSequence
    const dimensions = getRenderDimensions(quality)
    const iterationCount = getIterationCount()
    activeRenderId = renderId
    renderInFlight = true
    updateRenderStatus(
        'Rendering',
        `${quality === 'full' ? 'Full quality' : 'Interactive preview'} · ${iterationCount} iterations`
    )

    renderWorker.postMessage({
        renderId,
        width: dimensions.width,
        height: dimensions.height,
        realSet,
        imaginarySet,
        color: currentColor.value,
        maxIteration: iterationCount
    })
}

function scheduleRender(quality = 'full') {
    if (renderFrame !== null) {
        scheduledRenderQuality = scheduledRenderQuality === 'full' || quality === 'full' ? 'full' : quality
        return
    }

    scheduledRenderQuality = quality
    renderFrame = window.requestAnimationFrame(() => {
        const nextQuality = scheduledRenderQuality
        scheduledRenderQuality = 'full'
        render(nextQuality)
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

    scheduleRender('interactive')
    scheduleWheelSettleRender()
}

function scheduleWheelSettleRender() {
    if (wheelRenderTimeout !== null) {
        window.clearTimeout(wheelRenderTimeout)
    }

    wheelRenderTimeout = window.setTimeout(() => {
        wheelRenderTimeout = null
        scheduleRender('full')
    }, WHEEL_SETTLE_DELAY)
}

function resetView() {
    realSet = { ...DEFAULT_REAL_SET }
    imaginarySet = { ...DEFAULT_IMAGINARY_SET }
    scheduleRender('full')
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

    scheduleRender('drag')
}

window.addEventListener('resize', () => {
    resizeCanvas()
    scheduleRender('full')
})

downloadButton.addEventListener('click', () => {
    const data = canvas.toDataURL('image/jpeg')
    const link = document.createElement('a')
    link.href = data
    link.download = 'mandelbrot.jpg'
    link.click()
})

generateButton.addEventListener('click', () => {
    scheduleRender('full')
})

resetButton.addEventListener('click', () => {
    resetView()
})

currentColor.addEventListener('change', () => {
    scheduleRender('full')
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
    const wasDragging = isDragging
    isDragging = false
    dragStart = null
    dragStartRealSet = null
    dragStartImaginarySet = null
    canvas.style.cursor = 'grab'

    if (wasDragging) {
        scheduleRender('full')
    }
})

canvas.addEventListener('mouseleave', () => {
    if (!isDragging) {
        canvas.style.cursor = 'grab'
    }
})

resizeCanvas()
updateRenderStatus('Ready', `Full quality · ${getIterationCount()} iterations`)
scheduleRender('full')
