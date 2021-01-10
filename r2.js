const r2 = {};
function desync (x) {
  x.then(_ => {}).catch(console.error);
}

if (typeof document === 'undefined') {
  // nodejs
  const { ipcMain } = require('electron');
} else {
  const { ipcRenderer } = require('electron');
  // webkit
  r2.cmd = async function (cmd) {
    return ipcRenderer.invoke('r2cmd', cmd);
  };
  r2.plugins = async function (type) {
    return ipcRenderer.invoke('plugins', type);
  };
  r2.projects = async function () {
    return ipcRenderer.invoke('projects');
  };
}
