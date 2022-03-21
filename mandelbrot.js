let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

const WIDTH = window.innerWidth / 2
const HEIGHT = window.innerHeight / 2
ctx.canvas.width = WIDTH
ctx.canvas.height = HEIGHT

let MAX_ITERATION = 150

const REAL_SET = { min: -2, max: 1 }
const IMAGINARY_SET = { min: -1, max: 1 }

function mandelbrot(c) {
    let z = new Complex(0, 0), n = 0
    while (z.abs() <= 2 && n < MAX_ITERATION) {
        z = z.multiply(z).add(c)
        n += 1
    }
    return [n, z.abs() <= 2]
}

function draw(width, height) {
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            c_re = REAL_SET.min + (i / width) * (REAL_SET.max - REAL_SET.min)
            c_im = IMAGINARY_SET.min + (j / height) * (IMAGINARY_SET.max - IMAGINARY_SET.min)
            const [m, isInMandelbrotSet] = mandelbrot(new Complex(c_re, c_im))

            ctx.fillStyle = isInMandelbrotSet ? '#000' : "rgb(" + m + "," + m * 3 + "," + Math.log(m) + ")"
            ctx.fillRect(i, j, 1, 1)
        }
    }
}

draw(WIDTH, HEIGHT)