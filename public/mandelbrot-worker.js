const PALETTES = {
    red: [
        [18, 10, 24],
        [76, 18, 38],
        [166, 44, 56],
        [244, 122, 74],
        [255, 214, 153]
    ],
    green: [
        [8, 20, 18],
        [20, 64, 52],
        [44, 118, 84],
        [110, 188, 128],
        [222, 250, 205]
    ],
    blue: [
        [8, 15, 36],
        [22, 48, 96],
        [44, 96, 168],
        [82, 166, 232],
        [214, 242, 255]
    ],
    purple: [
        [20, 10, 40],
        [64, 28, 92],
        [124, 54, 166],
        [196, 114, 220],
        [247, 221, 255]
    ],
    orange: [
        [28, 14, 6],
        [96, 42, 12],
        [178, 84, 22],
        [242, 150, 56],
        [255, 229, 184]
    ],
    pink: [
        [34, 12, 26],
        [108, 30, 78],
        [194, 72, 134],
        [242, 152, 192],
        [255, 230, 243]
    ],
    brown: [
        [24, 16, 10],
        [76, 46, 26],
        [132, 82, 48],
        [190, 142, 96],
        [241, 223, 196]
    ],
    yellow: [
        [24, 18, 4],
        [102, 74, 10],
        [188, 148, 28],
        [244, 216, 90],
        [255, 248, 210]
    ],
    cyan: [
        [6, 20, 30],
        [12, 78, 102],
        [30, 144, 164],
        [98, 216, 218],
        [220, 250, 245]
    ]
}

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
            const escapeValue = mandelbrot(real, imaginary, maxIteration)
            const pixelIndex = (y * width + x) * 4
            const colorValue = escapeValue === null ? [4, 4, 10] : getColor(color, escapeValue, maxIteration)

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

    if (iteration === maxIteration) {
        return null
    }

    const magnitude = Math.sqrt(zReal * zReal + zImaginary * zImaginary)
    const smoothValue = iteration + 1 - Math.log2(Math.log2(magnitude))
    return Number.isFinite(smoothValue) ? smoothValue : iteration
}

function getColor(color, escapeValue, maxIteration) {
    const palette = PALETTES[color] || PALETTES.blue
    const normalized = Math.max(0, Math.min(1, escapeValue / maxIteration))
    const baseColor = samplePalette(palette, Math.pow(normalized, 0.74))
    const accentColor = samplePalette(palette, (normalized * 3.4 + 0.18) % 1)
    const contour = Math.pow(0.5 + 0.5 * Math.sin(escapeValue * 0.32), 1.35)
    const glow = Math.pow(normalized, 0.55)
    const mixAmount = 0.28 + contour * 0.42

    return [
        clampColor(baseColor[0] * (0.7 + glow * 0.55) + accentColor[0] * mixAmount),
        clampColor(baseColor[1] * (0.7 + glow * 0.55) + accentColor[1] * mixAmount),
        clampColor(baseColor[2] * (0.72 + glow * 0.48) + accentColor[2] * mixAmount)
    ]
}

function samplePalette(palette, position) {
    const scaled = Math.max(0, Math.min(0.999999, position)) * (palette.length - 1)
    const index = Math.floor(scaled)
    const mix = scaled - index
    const start = palette[index]
    const end = palette[Math.min(index + 1, palette.length - 1)]

    return [
        interpolate(start[0], end[0], mix),
        interpolate(start[1], end[1], mix),
        interpolate(start[2], end[2], mix)
    ]
}

function interpolate(start, end, amount) {
    return Math.round(start + (end - start) * amount)
}

function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)))
}
