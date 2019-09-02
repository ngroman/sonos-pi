# Raspberry Pi

Turn on and off my Denon AVR-S710W receiver from a Raspberry Pi.

Full credit to [Creating A Raspberry Pi Universal Remote With
LIRC](https://www.hackster.io/austin-stanton/creating-a-raspberry-pi-universal-remote-with-lirc-2fd581)
by Austin Stanton for circuit design and idea.

Equipment:
* Raspberry Pi 3 B+
* 5mm 940nm IR LED
* PN2222 transistor
* 100 ohm resistor
* 10k ohm resistor
* Breadboard
* Jumper wires

## IR (Lirc)
CLI Commands
```
irsend --count=5 SEND_ONCE denon-ir1 mainZoneOn
irsend --count=5 SEND_ONCE denon-ir1 allPowerOff
```

```
sudo systemctl restart lircd.service
systemctl status lircd.service
```

## Setup
Lirc (the IR control software) did not work out of the box with Raspian Buster. Luckily I found a
thread that saved me. Applying this patch should allow you to install it.

Source https://www.raspberrypi.org/forums/viewtopic.php?p=1475738

```
sudo apt install dh-exec doxygen expect libasound2-dev libftdi1-dev libsystemd-dev libudev-dev libusb-1.0-0-dev libusb-dev man2html-base portaudio19-dev socat xsltproc python3-yaml
mkdir build
cd build
apt source lirc
wget https://raw.githubusercontent.com/neuralassembly/raspi/master/lirc-gpio-ir-0.10.patch
patch -p0 -i lirc-gpio-ir-0.10.patch
cd lirc-0.10.1
debuild -uc -us -b
cd ..
sudo apt install ./liblirc0_0.10.1-5.2_armhf.deb ./liblircclient0_0.10.1-5.2_armhf.deb ./lirc_0.10.1-5.2_armhf.deb 
```
The final install command will fail. Then please configure the files shown below first, i.e., /boot/config.txt and /etc/lirc/lirc_options.conf. After that, please try the final install command again. Then the install will success.

In `/boot/config.txt`:
```
dtoverlay=gpio-ir,gpio_pin=24 
dtoverlay=gpio-ir-tx,gpio_pin=22
```
Send is on pin 22. Receive is unused.

In  `/etc/lirc/lirc_options.conf`:
For sending:
```
driver = default
device = /dev/lirc0
```
(For rec switch to `/dev/lirc1`; both can't be used at the same time.)


After editing, if you are using Raspbian Buster, please execute the final install command again here. Then the install will success.

`sudo systemctl restart lircd.service`


### System info ###
Raspberry PI 3 B+
Installed with NOOBS v3.1.1

```
lsb_release -a
No LSB modules are available.
Distributor ID:	Raspbian
Description:	Raspbian GNU/Linux 10 (buster)
Release:	10
Codename:	buster
```

```
uname -a
Linux raspberrypi 4.19.50-v7+ #896 SMP Thu Jun 20 16:11:44 BST 2019 armv7l GNU/Linux
```
