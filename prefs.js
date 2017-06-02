if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const electron = require('electron');
const dialogs = require('dialogs');
const {Menu, MenuItem, getCurrentWindow} = electron.remote;

//getCurrentWindow().setSize(400, 300, false);
electron.webFrame.setVisualZoomLevelLimits(1, 1);
electron.webFrame.setLayoutZoomLevelLimits(0, 0);

var clearScreen = false;
var prependScreen = false;
var filterWord = '';

document.addEventListener('DOMContentLoaded', function () {
  electron.ipcRenderer.send('run-command', 'ej');

  document.ondragover = (ev) => {
    ev.preventDefault();
  };
  document.ondrop = (ev) => {
    ev.preventDefault();
  };

  electron.ipcRenderer.on('command-output', (event, arg) => {
    const obj = JSON.parse(arg.result);
    switch (arg.command) {
    case 'ej':
  //    alert(obj['asm.arch']);
   //   alert(obj['asm.bits']);
      break;
    default:
      alert(JSON.stringify(obj));
      break;
    }
  });

  // boilerplate for tabs
  const $ = document.getElementById.bind(this);
  function onclick(name, cb) {
    try {
      $(name).onclick = cb;
    } catch (e) {
      alert(e + ' for ' + name);
    }
  }
  function resetTabs (but) {
    removeClass($('general-tab'), 'active');
    removeClass($('colors-tab'), 'active');
    removeClass($('analysis-tab'), 'active');
    removeClass($('project-tab'), 'active');
    if (but) {
      addClass($(but), 'active');
    }
  }
  onclick('check-button', _ => {
    getCurrentWindow().close();
  });
  onclick('general-tab', _=> {
    resetTabs('general-tab');
  });
  onclick('colors-tab', _=> {
    resetTabs('colors-tab');
  });
  onclick('analysis-tab', _=> {
    resetTabs('analysis-tab');
  });
  onclick('project-tab', _=> {
    resetTabs('project-tab');
  });
});
