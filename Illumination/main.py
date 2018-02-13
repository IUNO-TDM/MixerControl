#!/usr/bin/python

import threading
import time
import sys
import os

import argparse

import spidev

from socketIO_client import SocketIO, BaseNamespace

import Image

endThreads = 0

numPixels = 60          # Number of LEDs in strip
maxBrightness = 15      # led driving current [0-31]

productionStates = ["uninitialized", "waitingPump", "waitingOrder", "waitingStart", "startProcessing", "processingOrder", "finished", "errorProcessing", "productionPaused", "pumpControlServiceMode"]

currentState = ""
nextState = productionStates[0]

parser = argparse.ArgumentParser()
parser.add_argument("--spidev", help="spi device to control dotstar pixels", default=0, type=int)
parser.add_argument("--spics", help="chip select to control dotstar pixels", default=1, type=int)
parser.add_argument("--host", help="the address of the host running MixerControl", default="localhost")
parser.add_argument("--port", help="tcp port of the MixerControls socket.io", default=3000, type=int)

args = parser.parse_args()

#####
# Production Namespace
###
class ProductionNamespace(BaseNamespace):
    def on_connect(self):
        print('connected to namespace production')
        self.emit('room', 'state') # register room "state"

    def on_disconnect(self):
        print('disconnect from namespace production')

    def on_reconnect(self):
        print('reconnect to namespace production')
        self.emit('room', 'state') # register room "state"

def onProductionStateHandler( *args):
    global nextState
    print('state', args)

    if args[0] in productionStates:
        nextState = args[0]

#####
# Socket IO Client
###
class socketIoThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name

    def run(self):
        print "Starting " + self.name
        with SocketIO(args.host, args.port) as socketIO:
            print "SocketIO instantiated"
            production_namespace = socketIO.define(ProductionNamespace, '/production')
            production_namespace.on('state', onProductionStateHandler)

            while not endThreads:
                socketIO.wait(1)

            print "Exiting " + self.name

#####
# Dot Stars Animator
###
HZ = 50
class dotStarsThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name
        self.spi = spidev.SpiDev()

    def run(self):
        print "Starting " + self.name

        self.spi.open(args.spidev, args.spics)
        self.spi.max_speed_hz = 1600000

        images = {}
        for state in productionStates:
            filename = state+".png"

            # if no machine specific illumination pattern is there, try the standard pattern
            if not os.path.isfile(filename):
                print filename + " missing, trying to load standard pattern"
                filename = "standard-" + filename

            # if standard pattern is missing, continue with next pattern
            if not os.path.isfile(filename):
                print "illumination pattern for state " + state + " is not available"
                continue

            stateImage = {}
            img = Image.open(filename).convert("RGB")
            stateImage["image"] = img
            stateImage["pixels"] = img.load()
            stateImage["width"] = img.size[0]
            height = img.size[1]
            if (height > numPixels): height = numPixels # limit number of pixels in case image is too large
            stateImage["height"] = height
            images[state] = stateImage

        # Calculate gamma correction table, makes mid-range colors look 'right':
        gamma = bytearray(256)
        for i in range(256):
	        gamma[i] = int(pow(float(i) / 255.0, 2.7) * 255.0 + 0.5)

        spiArray = [0b11100000 | (maxBrightness & 31)] * (4 + numPixels * 4 + 1)

        while not endThreads:
            now = time.time()
            frame = int(now * HZ)
            global currentState
            if (currentState != nextState) and (nextState in images):
                currentState = nextState
                pixels    = images[currentState]["pixels"]
                width     = images[currentState]["width"]
                height    = images[currentState]["height"]

            spiArray[0] = 0 # start frame 0x00000000
            spiArray[1] = 0
            spiArray[2] = 0
            spiArray[3] = 0

            x = int(frame % width)
            for y in range(height):  # For each pixel in column...
                value = pixels[x, y] # Read pixel in image
                spiArray[4 + 4 * y + 0] = 0b11100000 | (maxBrightness & 31)
                spiArray[4 + 4 * y + 1] = gamma[value[2]] # blue
                spiArray[4 + 4 * y + 2] = gamma[value[1]] # green
                spiArray[4 + 4 * y + 3] = gamma[value[0]] # red

            spiArray[(4 + numPixels * 4)] = 0xff # end frame

            self.spi.xfer2(spiArray)

            time.sleep(float(frame + 1) / HZ - now)

        self.spi.close()
        print "Exiting " + self.name

threads = []

# start Threads
thread = socketIoThread ("SocketIo")
thread.start()
threads.append(thread)

thread = dotStarsThread ("DotStars")
thread.start()
threads.append(thread)

# wait until key pressed
try:
    while True:
        time.sleep(900)
except KeyboardInterrupt:
    pass

# Notify threads it's time to exit
endThreads = 1

# Wait for all threads to complete
for t in threads:
    t.join()
print "Exiting Main Thread"
