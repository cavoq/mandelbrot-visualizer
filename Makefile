NAME=mandelbrot-visualizer
HOST=0.0.0.0
PORT=7000
MAIN=server

help: ## Get help for Makefile
	@echo "\n#### $(NAME) ####\n"
	@echo "Available targets:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo "\n"

docker-build: ## Build docker image
	docker build -t $(NAME) .

docker-run: ## Run api inside docker container
	docker run --env-file .env -p $(PORT):$(PORT) --name mandelbrot-visualizer $(NAME)

docker-sh: ## Shell into docker container
	docker run -it $(NAME) sh

docker-remove: ## Remove docker container
	docker rm -f $(NAME)

.PHONY: help docker-build docker-run docker-sh