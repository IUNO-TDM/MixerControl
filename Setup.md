# Raspberry Pi einrichten
```
sudo adduser mixer

sudo apt-get update
sudo apt-get install maven screen libboost-all-dev libssl-dev
```

## PumpControl
codemeter_6.50.2631.502_armhf.deb von WIBU laden
private_src/decrypt.cpp vom Maschinenhersteller beziehen
pumpcontrol.settings.conf von einer bestehenden

```
rm pigpio.zip
sudo rm -rf PIGPIO
wget abyz.co.uk/rpi/pigpio/pigpio.zip
unzip pigpio.zip
cd PIGPIO
make
sudo make install

CodeMeter.h nach /usr/local/include legen

sudo dpkg -i codemeter_6.50.2631.502_armhf.deb 

git clone https://github.com/IUNO-TDM/PumpControl.git
cd PumpControl
git checkout testing

make
sudo chown root pumpcontrol.out 
sudo chgrp kmem pumpcontrol.out 
sudo chmod ug+s pumpcontrol.out 
```
## LicenseManager

````
git clone https://github.com/IUNO-TDM/LicenseManager.git
cd LicenseManager
make
````
## MixerControl

Mit dem **mixer** Nutzer anmelden:
````
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash
nvm install node
npm install pm2 -g

git clone https://github.com/IUNO-TDM/MixerControl.git
cd MixerControl/MixerControl-App
npm i

private config erstellen
pm2 config json erstellen
npm install -g @angular/cli
ng build --env=prod


````


Beispiel pm2_mixer.json:
````
{
  "apps": [
    {
      "name": "MixerControl",
      "script": "npm",
      "args": [
        "start"
      ],
      "watch": true,
      "node_args": "",
      "merge_logs": true,
      "cwd": "MixerControl/MixerControl-app",
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "testing",
        "TDM_MIXER_CONFIG": "private_config_testing"
      },
      "env_production": {
        "NODE_ENV": "production",
	"TDM_MIXER_CONFIG": "private_config_production"
      },
      "env_dev": {
        "NODE_ENV": "development"
      },
      "instances": 1
    },
    {
      "name": "PumpControl",
      "script": "./PumpControl/build/pumpcontrol.out",
      "args": [
        "-c","/home/mixer/pumpcontrol.settings.conf"
      ],
      "restart_delay": 10000,
      "max_restarts": 6,
      "watch": false,
      "merge_logs": true,
      "exec_interpreter": "none",
      "exec_mode": "fork",
      "cwd": "PumpControl",
      "env": {
      },
      "env_dev": {
      },
      "env_production":{
      },
      "instances": 1
    },
    {
      "name": "LicenseManager",
      "script": "./LicenseManager/build/LicenseManager",
      "args": [
        ""
      ],
      "watch": false,
      "merge_logs": true,
      "restart_delay": 10000,
      "max_restarts": 6,
      "exec_interpreter": "none",
      "exec_mode": "fork",
      "cwd": "LicenseManager",
      "env": {
      },
      "env_dev": {
      },
      "env_production":{
      },
      "instances": 1
    },
    {
      "name": "PaymentService",
      "script": "/usr/bin/mvn",
      "args": [
        "jetty:run"
      ],
      "restart_delay": 10000,
      "max_restarts": 6,
      "watch": false,
      "merge_logs": true,
      "exec_interpreter": "none",
      "exec_mode": "fork",
      "cwd": "PaymentService",
      "env": {
      },
      "env_dev": {
      },
      "env_production":{
      },
      "instances": 1
    }
  ]
}
````

## PaymentService

Download http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

`````
mkdir /opt/jdk
  update-alternatives --install /usr/bin/java java /opt/jdk/jdk1.8.0_.../bin/java 400
  update-alternatives --install /usr/bin/javac javac /opt/jdk/jdk1.8.0_.../bin/javac 400


git clone https://github.com/IUNO-TDM/PaymentService.git
cd PaymentService
Wallet Seed übernehmen: pom.xml anpassen: <walletSeed>.....</walletSeed>
mvn clean package jetty:run
````