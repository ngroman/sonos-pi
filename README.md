## Install yarn
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
