if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const electron = require('electron');
const dialogs = require('dialogs');
const {Menu, MenuItem, getCurrentWindow} = electron.remote;

electron.webFrame.setVisualZoomLevelLimits(1, 1);
electron.webFrame.setLayoutZoomLevelLimits(0, 0);

var clearScreen = false;
var prependScreen = false;
var filterWord = '';

  getCurrentWindow().setSize(400, 300, false);
document.addEventListener('DOMContentLoaded', function () {

  // getCurrentWindow().webContents.openDevTools();

  function decimalToHexString (number) {
    if (number !== +number) {
      return number;
    }
    if (number < 0) {
      number = 0xFFFFFFFF + number + 1;
    }
    return '0x' + number.toString(16);
  }

  function seekTo (addr) {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 's ' + addr + ';' + printCommand);
  }

  electron.ipcRenderer.send('run-command', 'b 1024;e scr.color=true;e scr.html=true');
  electron.ipcRenderer.send('run-command', 'o;i');
  electron.ipcRenderer.send('run-command', '?E Welcome to r2app 0.1');

  function labelNew (name, addr) {
if (filterWord) {
  if (name.indexOf(filterWord) === -1) {
  return '';
  }
}
    addr = decimalToHexString(addr);
    return `
    <tr class="clickableLabel">
      <td>${addr}</td>
      <td>${name}</td>
    </tr>
`;
  }

  function labelLoadFunctions () {
    electron.ipcRenderer.send('list', listCommand);
  }

  function labelLoadFlags () {
    electron.ipcRenderer.send('list', listCommand = 'flags');
  }

  electron.ipcRenderer.on('list', (event, arg) => {
    let str = '';
    switch (arg.type) {
      case 'imports':
        if (arg.data instanceof Array) {
          for (let f of arg.data) {
            str += labelNew(f.name, f.ordinal); //f.type + ' ' + f.bind);
          }
        } else {
          if (Object.keys(arg.data).length !== 0) {
            alert('Unexpected type: ' + JSON.stringify(arg.data));
          }
        }
        break;
      case 'flags':
      case 'fcns':
        if (arg.data instanceof Array) {
          for (let f of arg.data) {
            str += labelNew(f.name, f.offset);
          }
        } else {
          if (Object.keys(arg.data).length !== 0) {
            alert('Unexpected type: ' + JSON.stringify(arg.data));
          }
        }
        break;
      case 'symbols':
        if (arg.data instanceof Array) {
          for (let f of arg.data) {
            str += labelNew('sym.' + f.name, f.offset || f.vaddr);
          }
        }
        break;
      case 'comments':
        if (arg.data instanceof Array) {
          for (let f of arg.data) {
if (f.type === 'CCu') {
            str += labelNew('sym.' + f.name, f.offset || f.vaddr);
}
          }
        }
        break;
      default:
        alert(JSON.stringify(arg.type));
      case 'regs':
      case 'sections':
        if (arg.data instanceof Array) {
          for (let f of arg.data) {
            str += labelNew(f.name, f.offset || f.vaddr);
          }
        } else {
          for (let f of Object.keys(arg.data)) {
            str += labelNew(f, arg.data[f]);
          }
        }
        break;
    }
  });


  document.ondragover = (ev) => {
    ev.preventDefault();
  };
  document.ondrop = (ev) => {
    ev.preventDefault();
    const path = ev.dataTransfer.files[0].path;
    electron.ipcRenderer.send('ondragstart', path);
  };

  electron.ipcRenderer.on('open-tab', (event, arg) => {
    switch (arg.name) {
      case 'goto':
        dialogs().prompt('Goto address or flag...', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 's ' + name + ';' + printCommand);
          }
        });
        break;
      case 1:
        resetTabs();
        addClass(consoleTab, 'active');
        break;
      case 2:
        resetTabs();
        addClass(dashboardTab, 'active');
        if (dashboardWindow) {
          dashboardWindow.style.visibility = 'visible';
        }
        break;
      case 3:
        resetTabs(searchTab);
        if (searchWindow) {
          searchWindow.style.visibility = 'visible';
        }
        break;
      case 4:
        resetTabs();
        addClass(scriptingTab, 'active');
        if (scriptingWindow) {
          scriptingWindow.style.visibility = 'visible';
        }
        break;
      case 5:
        resetTabs();
        addClass(notesTab, 'active');
        if (notesWindow) {
          notesWindow.style.visibility = 'visible';
        }
        break;
    }
  });
  electron.ipcRenderer.on('command-output', (event, arg) => {
    console.log(arg);
  });

  function onclick(name, cb) {
    const x = document.getElementById(name);
    x.onclick = cb;
  }

    // getCurrentWindow().webContents.openDevTools();
  onclick ('check-button', () => {
console.log("YOUWIN");
    getCurrentWindow().close();
  });

  const generalTab = document.getElementById('general-tab');
  const colorsTab = document.getElementById('colors-tab');
  const analysisTab = document.getElementById('analysis-tab');
  const projectTab = document.getElementById('project-tab');
  function resetTabs (but) {
    removeClass(generalTab, 'active');
    removeClass(colorsTab, 'active');
    removeClass(analysisTab, 'active');
    removeClass(projectTab, 'active');
    if (but) {
      addClass(but, 'active');
    }
  }
  generalTab.onclick = () => {
    resetTabs(generalTab);
  };
  colorsTab.onclick = () => {
    resetTabs(colorsTab);
  };
  analysisTab.onclick = () => {
    resetTabs(analysisTab);
  };
  projectTab.onclick = () => {
    resetTabs(projectTab);
  };
});
