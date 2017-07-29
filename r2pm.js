if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const dialogs = require('dialogs');
const electron = require('electron');
const {Menu, MenuItem, getCurrentWindow} = electron.remote;
electron.webFrame.setVisualZoomLevelLimits(1, 1);
electron.webFrame.setLayoutZoomLevelLimits(0, 0);
// getCurrentWindow().webContents.openDevTools();

const $ = document.getElementById.bind(document);

document.addEventListener('DOMContentLoaded', function () {
  const updateButton = document.getElementById('update-button');
  updateButton.onclick = () => {
    electron.ipcRenderer.send('package-update');
  };
  const homeButton = document.getElementById('home-button');
  homeButton.onclick = () => {
    document.location.href = 'index.html';
  };
});

electron.ipcRenderer.on('done', (event, arg) => {
  dialogs().alert('Done', _ => {
    electron.ipcRenderer.send('package-list');
  });
});

try {
  electron.ipcRenderer.send('package-list');
  electron.ipcRenderer.on('packages', (event, res) => {
    let msg = '';
    // msg += '<hr><td>one</td><td>two</td><td style="width:100%">tri</td></hr>';
    let n = 0;
    for (let pkg of res) {
      let trAttr = '';
      if (pkg.installed) {
        trAttr = 'style="background-color:#c0e0c0"';
      }
      msg += '<tr id="pkg' + n + '" ' + trAttr + '><td><b>' + pkg.name + '</b></td><td>' + pkg.type + '</td><td>' + pkg.desc + '</td></tr>\n';
      n++;
    }
    $('pkgs-table').innerHTML = msg;
    n = 0;
    for (let pkg of res) {
      const row = 'pkg' + n;
      $(row).onclick = function () {
        if (pkg.installed) {
          dialogs().confirm('Uninstall?', '', (name) => {
            if (name) {
              electron.ipcRenderer.send('package-uninstall', pkg.name);
            } else {
              dialogs().confirm('Upgrade?', '', (name) => {
                if (name) {
                  electron.ipcRenderer.send('package-upgrade', pkg.name);
                }
              });
            }
          });
          // query the user to upgrade/reinstall or remove
        } else {
          dialogs().confirm('Install?', '', (name) => {
            if (name) {
              electron.ipcRenderer.send('package-install', pkg.name);
            }
          });
        }
      };
      n++;
    }
  });
} catch (e) {
  console.log(e);
  alert('' + e);
}
