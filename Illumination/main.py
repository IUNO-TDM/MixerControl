#!/usr/bin/python

import threading
import time

endThreads = 0

class socketIoThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name
    def run(self):
        print "Starting " + self.name
        while not endThreads:
            pass
        print "Exiting " + self.name

class dotStarsThread (threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name
    def run(self):
        print "Starting " + self.name
        while not endThreads:
            pass   
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
