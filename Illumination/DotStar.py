import spidev

#####
# DotStar SPI class
###
class DotStar():
    def __init__(self, numPixels, maxBrightness=8):
        assert maxBrightness <= 31, "maxBrightness must be lower than 32"
        assert 0 < maxBrightness, "maxBrightness must be greater than 0"
        self.maxBrightness = maxBrightness
        self.numPixels = numPixels

        # Calculate gamma correction table, makes mid-range colors look 'right':
        self.gamma = bytearray(256)
        for i in range(256):
	        self.gamma[i] = int(pow(float(i) / 255.0, 2.7) * 255.0 + 0.5)

        self.spi = spidev.SpiDev()

        self.spiArray = [0b11100000 | (maxBrightness & 31)] * (4 + numPixels * 4 + 1)

        # start frame 0x00000000
        self.spiArray[0] = 0
        self.spiArray[1] = 0
        self.spiArray[2] = 0
        self.spiArray[3] = 0

        # end frame
        self.spiArray[(4 + numPixels * 4)] = 0xff

    def open(self, spidev, spics):
        self.spi.open(spidev, spics)
        self.spi.max_speed_hz = 1600000

    def setPixel(self, index, r, g, b):
        assert index < self.numPixels, "dotStar pixel index %d is out of range [0:%d]" % (index, self.numPixels)
#        self.spiArray[4 + 4 * index + 0] = 0b11100000 | (maxBrightness & 31)
        self.spiArray[4 + 4 * index + 1] = self.gamma[b] # blue
        self.spiArray[4 + 4 * index + 2] = self.gamma[g] # green
        self.spiArray[4 + 4 * index + 3] = self.gamma[r] # red

    def show(self):
        self.spi.writebytes(self.spiArray)

    def close(self):
        self.spi.close()

