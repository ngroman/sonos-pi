DOCKER_TAG=sonos-control

.PHONY: docker-build
docker-build:
	docker build . --tag $(DOCKER_TAG)
