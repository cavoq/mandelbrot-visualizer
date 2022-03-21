class Complex {
    constructor(re, im) {
        this.re = re
        this.im = im
    }

    add(c) {
        const re = this.re + c.re
        const im = this.im + c.im
        return new Complex(re, im)
    }

    subtract(c) {
        const re = this.re - c.re
        const im = this.im - c.im
        return new Complex(re, im)
    }

    multiply(c) {
        const re = this.re * c.re - this.im * c.im
        const im = this.re * c.im + this.im * c.re
        return new Complex(re , im)
    }

    abs() {
        return Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2))
    }
}