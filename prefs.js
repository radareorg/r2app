if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const electron = require('electron');
const dialogs = require('dialogs');
const { Menu, MenuItem, getCurrentWindow } = electron.remote;

// getCurrentWindow().webContents.openDevTools();

// getCurrentWindow().setSize(400, 300, false);
// electron.webFrame.setVisualZoomLevelLimits(1, 1);
// electron.webFrame.setLayoutZoomLevelLimits(0, 0);

const clearScreen = false;
const prependScreen = false;
const filterWord = '';

document.addEventListener('DOMContentLoaded', function () {
  electron.ipcRenderer.send('run-command', 'ej|');

  document.ondragover = (ev) => {
    ev.preventDefault();
  };
  document.ondrop = (ev) => {
    ev.preventDefault();
  };

  electron.ipcRenderer.on('command-output', (event, arg) => {
    try {
      const obj = JSON.parse(arg.result);
      switch (arg.command) {
        case 'ej|':
          //   alert(obj['asm.arch']);
          //   alert(obj['asm.bits']);
          break;
        default:
          alert(JSON.stringify(obj));
          break;
      }
    } catch (e) {
      alert(arg.result);
    }
  });

  // boilerplate for tabs
  const $ = document.getElementById.bind(this);
  function onclick (name, cb) {
    try {
      $(name).onclick = cb;
    } catch (e) {
      alert(e + ' for ' + name);
    }
  }
  function resetTabs (but) {
    removeClass($('general-tab'), 'active');
    // removeClass($('colors-tab'), 'active');
    removeClass($('analysis-tab'), 'active');
    removeClass($('debugger-tab'), 'active');
    removeClass($('disasm-tab'), 'active');
    //   removeClass($('project-tab'), 'active');
    $('general-div').style.visibility = 'hidden';
    // $('colors-div').style.visibility = 'hidden';
    $('analysis-div').style.visibility = 'hidden';
    $('debugger-div').style.visibility = 'hidden';
    $('disasm-div').style.visibility = 'hidden';
    // $('project-div').style.visibility = 'hidden';
    if (but) {
      addClass($(but), 'active');
      $(but.replace('-tab', '-div')).style.visibility = 'visible';
    }
  }
  /*
  onclick('check-button', _ => {
    getCurrentWindow().close();
  });
*/
  onclick('general-tab', _ => {
    resetTabs('general-tab');
  });
  /*
  onclick('colors-tab', _ => {
    resetTabs('colors-tab');
  });
*/
  onclick('analysis-tab', _ => {
    resetTabs('analysis-tab');
  });
  onclick('debugger-tab', _ => {
    resetTabs('debugger-tab');
  });
  onclick('disasm-tab', _ => {
    resetTabs('disasm-tab');
  });
  /*
  onclick('project-tab', _ => {
    resetTabs('project-tab');
  });
*/
  resetTabs('general-tab');
});
