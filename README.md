# Sonos -> Raspberry Pi -> Denon Receiver

Trigger a Raspberry Pi based IR-blaster every time when I play music on my Sonos Connect.


# Software install

## Install yarn on raspberry pi
https://yarnpkg.com/lang/en/docs/install/#debian-stable

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get update
sudo apt-get install yarn
```

## Create system user
`sudo useradd -r -s /bin/false sonos`


## Set up systemd service
https://medium.com/@simon_prickett/writing-a-systemd-service-in-node-js-on-raspberry-pi-be88d9bc2e8d

```
sudo cp sonos.service /etc/systemd/system
sudo systemctl enable sonos.service

sudo systemctl start sonos.service
```

Tail logs:
```
journalctl -u sonos -f
```

# Docker install
Follow https://docs.docker.com/engine/install/debian/
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

`sudo docker compose up -d`
