# Sonos -> Raspberry Pi -> Denon Receiver

Start my Denon receiver when I play music on my Sonos Connect.


# Docker install
Follow docker [debian guide](https://docs.docker.com/engine/install/debian/)
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

```
sudo docker run hello-world
```

# Docker setup
sudo docker build . --tag sonos-control
# Note needs `--network=host` to allow for multicast for Sonos
sudo docker run --network=host sonos-control

Start as daemon (in directory with `docker-componse.yml`)
```
sudo docker compose up -d`
```

Tail logs:
```
sudo docker compose logs -t -f
```
