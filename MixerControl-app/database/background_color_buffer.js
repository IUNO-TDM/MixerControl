var BackgroundColorBuffer = function () {

};
var backgroundColorBuffer = new BackgroundColorBuffer();
backgroundColorBuffer.colorDict = {};

backgroundColorBuffer.addColor = function(id, color)
{
  backgroundColorBuffer.colorDict[id] = color;
};

backgroundColorBuffer.getColor = function(id)
{
  return backgroundColorBuffer.colorDict[id];
};

module.exports = backgroundColorBuffer;
