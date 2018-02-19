#!/usr/bin/python

import threading
import time
import sys
import os
import argparse
import Queue as queue

import DotStar

from socketIO_client import SocketIO, BaseNamespace

import Image

endThreads = 0

numPixels = 60          # Number of LEDs in strip
maxBrightness = 15      # led driving current [0-31]

productionStates = ["uninitialized", "waitingPump", "waitingOrder", "waitingStart", "startProcessing", "processingOrder", "finished", "errorProcessing", "productionPaused", "pumpControlServiceMode"]

nextStates = queue.Queue()
nextStates.put(productionStates[0])

productionProgress = 0

parser = argparse.ArgumentParser()
parser.add_argument("--spidev", help="spi device to control dotstar pixels", default=1, type=int)
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
        self.emit('room', 'pumpControl') # register room "pumpControl"

    def on_disconnect(self):
        print('disconnect from namespace production')
        nextStates.put(productionStates[0])

    def on_reconnect(self):
        print('reconnect to namespace production')
        self.emit('room', 'state') # register room "state"
        self.emit('room', 'pumpControl') # register room "pumpControl"

def onProductionStateHandler( *args):
    print('state', args)

    if args[0] in productionStates:
        nextStates.put(args[0])

def onProgressHandler( *args):
    global productionProgress
    productionProgress = args[0]
    print('progress', productionProgress)

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
            production_namespace = socketIO.define(ProductionNamespace, '/production')
            production_namespace.on('state', onProductionStateHandler)
            production_namespace.on('progress', onProgressHandler)

            while not endThreads:
                socketIO.wait(1)

            print "Exiting " + self.name

#####
# one time overlay
###
class OneTimeOverlay():
    def __init__(self, image):
        self.image = image
        self.width = self.image.size[0]
        self.startFrame = 0

    def startOverlay(self, frame):
        self.startFrame = frame

    def paste(self, frame, background):
        x = frame - self.startFrame
        if (self.width < x):
            return background
        overlay = self.image.crop((x, 0, x+1, self.image.size[1]))
        return Image.alpha_composite(background, overlay)

#####
# Dot Stars Animator
###
HZ = 50
class dotStarsThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name
        self.currentState = ""
        self.loadImages()

    def tryLoadImage(self, filename):
        # if no machine specific illumination pattern is there, try the standard pattern
        if not os.path.isfile(filename):
            print filename + " missing, trying to load standard pattern"
            filename = "standard-" + filename

        # if standard pattern is missing, continue with next pattern
        if not os.path.isfile(filename):
            print filename + " is not available"
            return

        image = Image.open(filename).convert("RGBA")
        assert numPixels == image.size[1]
        return image

    def loadImages(self):
        self.progressImage = Image.open("progress.png").convert("RGBA")

        self.images = {}
        self.oneTimeOverlays = {}

        for state in productionStates:
            img = self.tryLoadImage("overlay-"+state+".png")
            if (img):
                self.oneTimeOverlays[state] = OneTimeOverlay(img)

            img = self.tryLoadImage(state+".png")
            if (img):
                stateImage = {}
                stateImage["image"] = img
                stateImage["width"] = img.size[0]

                # limit number of pixels in case image is too large
                height = img.size[1]
                if (height > numPixels): height = numPixels
                stateImage["height"] = height

                self.images[state] = stateImage

    def run(self):
        print "Starting " + self.name
        ds = DotStar.DotStar(numPixels, maxBrightness)
        ds.open(args.spidev, args.spics)

        while not endThreads:
            # calculate current framenumber
            now = time.time()
            frame = int(now * HZ)

            # handle state changes
            while (not nextStates.empty()):
                nextState = nextStates.get()
                if (nextState in self.oneTimeOverlays.keys()):
                    self.oneTimeOverlays[nextState].startOverlay(frame)

                if (nextState in self.images):
                    self.currentState = nextState
                    img       = self.images[nextState]["image"]
                    width     = self.images[nextState]["width"]
                    height    = self.images[nextState]["height"]

            # get background image column
            x = int(frame % width)
            column = img.crop((x, 0, x+1, img.size[1]))

            # conditionally overlay one time patterns
            for overlay in self.oneTimeOverlays.itervalues():
                column = overlay.paste(frame, column)

            # overlay progress image in state processingOrder
            if (self.currentState == "processingOrder"):
                progress = self.progressImage.crop((productionProgress, 0, productionProgress+1, height))
                column = Image.alpha_composite(column, progress)

            pixels = column.load()
            for y in range(height):  # For each pixel in column...
                value = pixels[0, y] # Read pixel in image
                r = value[0]
                g = value[1]
                b = value[2]

                ds.setPixel(y, r, g, b)

            ds.show()

            time.sleep(float(frame + 1) / HZ - now)

        ds.close()
        print "Exiting " + self.name

#######
# main
###

threads = []

# start Threads
thread = dotStarsThread ("DotStars")
thread.start()
threads.append(thread)

thread = socketIoThread ("SocketIO")
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
