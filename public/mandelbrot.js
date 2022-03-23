let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let downloadButton = document.getElementById('download-button')
let generateButton = document.getElementById('generate-button')
let currentColor = document.getElementById('color-select')

ctx.canvas.width = window.innerWidth / 1.5
ctx.canvas.height = window.innerHeight / 1.5

let MAX_ITERATION = 150

const REAL_SET = { min: -2, max: 1 }
const IMAGINARY_SET = { min: -1, max: 1 }

function mandelbrot(c) {
    let z = new Complex(0, 0),
        n = 0
    while (z.abs() <= 2 && n < MAX_ITERATION) {
        z = z.multiply(z).add(c)
        n += 1
    }
    return [n, z.abs() <= 2]
}

function draw(canvas, color) {
    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            c_re = REAL_SET.min + (i / canvas.width) * (REAL_SET.max - REAL_SET.min)
            c_im = IMAGINARY_SET.min + (j / canvas.height) * (IMAGINARY_SET.max - IMAGINARY_SET.min)
            const [m, isInMandelbrotSet] = mandelbrot(new Complex(c_re, c_im))

            ctx.fillStyle = isInMandelbrotSet ? '#000' : getColor(color, m / 3)
            ctx.fillRect(i, j, 1, 1)
        }
    }
}

function getColor(color, m) {
    switch (color) {
        case 'red':
            return `rgb(${255 / m} ,${m} , ${m})`
        case 'green':
            return `rgb(${m}, ${255 / m}, ${m})`
        case 'blue':
            return `rgb(${m}, ${m}, ${255 / m})`
        case 'yellow':
            return `rgb(${255 / m}, ${255 / m}, ${m})`
        case 'orange':
            return `rgb(${255 / m}, ${165 / m}, ${m})`
        case 'purple':
            return `rgb(${128 / m}, ${m}, ${128 / m})`
        case 'pink':
            return `rgb(${255 / m}, ${192 / m}, ${203 / m})`
        case 'brown':
            return `rgb(${165 / m}, ${42 / m}, ${42 / m})`
        case 'cyan':
            return `rgb(${m}, ${255 / m}, ${255 / m})`
    }
}

window.addEventListener('resize', () => {
    ctx.canvas.height = window.innerHeight / 1.5
    ctx.canvas.width = window.innerWidth / 1.5
});

downloadButton.addEventListener('click', () => {
    const data = canvas.toDataURL('image/jpeg')
    const link = document.createElement('a')
    link.href = data
    link.download = 'mandelbrot.jpg'
    link.click()
})

generateButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw(canvas, currentColor.value)
})