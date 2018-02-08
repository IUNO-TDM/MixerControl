#! /bin/bash

if [ `whoami` != 'root' ]; then
    echo "Re-run this script as root user!"
    exit
fi

BCTIME=4 # duration in seconds each beacon is broadcasted

# initialise bluetooth hardware
hciconfig hci0 up
hciconfig hci0 leadv 3
hciconfig hci0 noscan

while (1); do
    # iBeacon
    hcitool -i hci0 cmd 0x08 0x0008 1E 02 01 1A 1A FF 4C 00 02 15 1E 80 9A 70 DF 5E 4C 81 BF E0 54 9D 55 2D 0B AF 00 00 00 00 C8
    sleep $BCTIME

    # Eddystone beacon
    hcitool -i hci0 cmd 0x08 0x0008 1e 02 01 06 03 03 aa fe 16 16 aa fe 10 00 03 69 75 6e 6f 2e 61 78 6f 6f 6d 2e 63 6c 6f 75 64 00    
    sleep $BCTIME
done
