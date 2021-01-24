const rasm2 = {};
function forceDefaultZoom () {
  const electron = require('electron');
  const webFrame = electron.webFrame;
  //webFrame.setZoomFactor(1);
  webFrame.setVisualZoomLevelLimits(1, 1);
}
//forceDefaultZoom();
