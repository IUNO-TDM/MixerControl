#!/usr/bin/python

import threading
import time

from socketIO_client import SocketIO, BaseNamespace

from dotstar import Adafruit_DotStar
import Image

endThreads = 0

numpixels = 60          # Number of LEDs in strip
filename  = "default.png" # Image file to load

#####
# Production Namespace
###
class ProductionNamespace(BaseNamespace):
    productionStates = ["uninitialized", "waitingPump", "waitingOrder", "waitingStart", "startProcessing", "processingOrder", "finished", "errorProcessing", "productionPaused", "pumpControlServiceMode"]
    def on_connect(self):
        print('connected to namespace production')
        self.emit('room', 'state') # register room "state"

    def on_disconnect(self):
        print('disconnect from namespace production')

    def on_reconnect(self):
        print('reconnect to namespace production')
        self.emit('room', 'state') # register room "state"

def onProductionStateHandler( *args):
    print('state', args)

    if args[0] == "waitingOrder":
        pass

#####
# Socket IO Client
###
class socketIoThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name

    def run(self):
        print "Starting " + self.name
        with SocketIO('192.168.178.40', 3000) as socketIO:
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

    def run(self):
        print "Starting " + self.name

        strip     = Adafruit_DotStar(numpixels)
        strip.begin()


        print "Loading..."
        img       = Image.open(filename).convert("RGB")
        pixels    = img.load()
        width     = img.size[0]
        height    = img.size[1]
        print "%dx%d pixels" % img.size

        if(height > strip.numPixels()): height = strip.numPixels()

        # Calculate gamma correction table, makes mid-range colors look 'right':
        gamma = bytearray(256)
        for i in range(256):
	        gamma[i] = int(pow(float(i) / 255.0, 2.7) * 255.0 + 0.5)

        while not endThreads:
            now = time.time()
            frame = int(now * HZ)

            for x in range(width):           # For each column of image...
                time.sleep(1.0 / 50)     # Pause 20 milliseconds (~50 fps)
                for y in range(height):  # For each pixel in column...
                    value = pixels[x, y]   # Read pixel in image
                    strip.setPixelColor(y, # Set pixel in strip
                      gamma[value[1]],     # Gamma-corrected red
                      gamma[value[0]],     # Gamma-corrected green
                      gamma[value[2]])     # Gamma-corrected blue
                strip.show()             # Refresh LED strip

            delay = float(int(now * HZ) + 1) / HZ - now
            if delay > 1.0/HZ: print frame, delay
            time.sleep(delay)

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
