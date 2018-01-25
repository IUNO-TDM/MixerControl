#!/usr/bin/python

import threading
import time
import sys
import os

import spidev

from socketIO_client import SocketIO, BaseNamespace

import Image

endThreads = 0

numpixels = 60          # Number of LEDs in strip

productionStates = ["uninitialized", "waitingPump", "waitingOrder", "waitingStart", "startProcessing", "processingOrder", "finished", "errorProcessing", "productionPaused", "pumpControlServiceMode"]

currentState = ""
nextState = productionStates[0]

mixerHost = 'localhost'
if len (sys.argv) > 1:
    mixerHost = sys.argv[1];

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
        with SocketIO(mixerHost, 3000) as socketIO:
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

        self.spi.open(1, 1)

        images = {}
        for state in productionStates:
            filename = state+".png"
            if not os.path.isfile(filename):
                print filename + " missing"
                continue
            stateImage = {}
            img = Image.open(filename).convert("RGB")
            stateImage["image"] = img
            stateImage["pixels"] = img.load()
            stateImage["width"] = img.size[0]
            height = img.size[1]
            if(height > strip.numPixels()): height = strip.numPixels()
            stateImage["height"] = height
            images[state] = stateImage

        # Calculate gamma correction table, makes mid-range colors look 'right':
        gamma = bytearray(256)
        for i in range(256):
	        gamma[i] = int(pow(float(i) / 255.0, 2.7) * 255.0 + 0.5)

        spiArray = bytearray(4 + numpixels * 4 + 4)

        for i in range(len(spiArray)):
            spiArray[i] = 0xff # global LED bits and end frame 0xffffffff

        spiArray[0] = 0 # start frame 0x00000000
        spiArray[1] = 0
        spiArray[2] = 0
        spiArray[3] = 0

        while not endThreads:
            now = time.time()
            frame = int(now * HZ)
            global currentState
            if (currentState != nextState) and (nextState in images):
                currentState = nextState
                pixels    = images[currentState]["pixels"]
                width     = images[currentState]["width"]
                height    = images[currentState]["height"]

            x = int(frame % width)
            for y in range(height):  # For each pixel in column...
                value = pixels[x, y]   # Read pixel in image
                spiArray[4 + y + 1] = gamma[value[2]]
                spiArray[4 + y + 2] = gamma[value[0]]
                spiArray[4 + y + 3] = gamma[value[1]]

            self.spi.xfer2(spiArray)

            delay = float(int(now * HZ) + 1) / HZ - now
            if delay > 1.0/HZ: print frame, delay
            time.sleep(delay)

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
