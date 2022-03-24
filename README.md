# mandelbrot-visualizer
Visualizer for the Mandelbrot set with following functionality:

* Download the generated image
* Generate the Mandelbrot set in different colors

## Preview

![Bildschirmfoto vom 2022-03-23 22-22-58](https://user-images.githubusercontent.com/61215846/159800797-32fd6a9f-e117-470e-9361-a53e0ced978a.png)


## Requirements

For this script to work, you need to have [Docker](https://www.docker.com/products/docker-desktop) installed

## Build

**1. Clone the repository**
```
git clone https://github.com/Dav3o/mandelbrot-visualizer.git
```
**2. Go into the cloned repository**
```
cd mandelbrot-visualizer
```
**3. Build the docker image**
```
docker build .
```
## Usage

# Run with Docker

**Run container and specify host and port by using flags**
```
docker run -e HOST=<HOST> -e PORT=<PORT> -p <HOST_PORT>:<CONTAINER_PORT> IMAGE_NAME
```
**Run container and specify host and port by *.env* file**
```
docker run --env-file .env -p <HOST_PORT>:<CONTAINER_PORT> IMAGE_NAME
```
*Note:* if you don't specify anything the default host will be set to 0.0.0.0:8000
