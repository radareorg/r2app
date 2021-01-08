
const openButton = document.querySelector('.button');
const electron = require('electron');

const openDevTools = false;

// electron.webFrame.setVisualZoomLevelLimits(1, 1);
// electron.webFrame.setLayoutZoomLevelLimits(0, 0);

setInterval(_ => {
  electron.ipcRenderer.send('list', 'sessions');
}, 1000);
electron.ipcRenderer.send('list', 'sessions');

electron.ipcRenderer.on('list', (event, arg) => {
  if (arg.type === 'sessions') {
    const s = document.getElementById('sessions');
    const list = arg.data.data.data;
    if (list && list.length > 0) {
      s.onclick = _ => {
        openShell();
      };
      s.style.visibility = 'visible';
      s.style['z-index'] = 1000;
      let str = '<label>Sessions</label>\n';
      str += '<ul class="list-group">';
      for (let ses of list) {
        str += '<li class="my-group-item hlhover green"> &nbsp;&nbsp; r2 ' + ses.file + '</li>\n';
      }
      str += '</ul>';
      s.innerHTML = str;
    } else {
      // no sessions found
      // hide
      s.style.visibility = 'hidden';
    }
  }
});

electron.ipcRenderer.on('open-tab', (event, arg) => {
  const webview = document.getElementById('shell-iframe');
  webview.send('open-tab', arg);
});

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input');
  electron.ipcRenderer.on('version', (event, arg) => {
    try {
      const r2version = document.getElementById('r2version');
      r2version.innerHTML = arg.result;
    } catch (e) {
      alert(e);
    }
  });
  electron.ipcRenderer.send('version');

  fileInput.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      openFile([]);
    }
  });
  const fileButton = document.getElementById('file-button');
  const etcButton = document.getElementById('etc-button');
  const updateButton = document.getElementById('update-button');
  const updateWindow = document.getElementById('update-window');
  const aboutButton = document.getElementById('about-button');
  const debugButton = document.getElementById('debug-button');
  const homeButton = document.getElementById('home-button');
  const rwButton = document.getElementById('rw-button');
  const binButton = document.getElementById('bin-button');
  const strButton = document.getElementById('str-button');
  const analButton = document.getElementById('anal-button');
  const r2pmButton = document.getElementById('r2pm-button');

  function toggleable (x) {
    x.onclick = () => {
      if (hasClass(x, 'active')) {
        removeClass(x, 'active');
      } else {
        addClass(x, 'active');
      }
    };
  }

  toggleable(rwButton);
  toggleable(strButton);
  toggleable(binButton);
  toggleable(analButton);

  r2pmButton.onclick = () => {
    document.location.href = 'r2pm.html';
  };
  homeButton.onclick = () => {
    updateWindow.style.visibility = 'hidden';
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      updateWindow.style.visibility = 'hidden';
    }
  });
  function openFile (opts) {
    electron.ipcRenderer.send('open-file', {
      path: fileInput.value || '/bin/ls', options: opts
    });
  }
  updateButton.onclick = () => {
    updateWindow.style.visibility = 'visible';
    updateWindow.style.zIndex = 100;
  };
  etcButton.onclick = () => {
    const path = electron.remote.dialog.showOpenDialog({
      properties: ['openFile']
    });
    if (typeof path !== 'undefined') {
      fileInput.value = path;
    }
  };
  fileButton.onclick = () => {
    const bin = hasClass(binButton, 'active');
    const anal = hasClass(analButton, 'active');
    const opts = [];
    if (hasClass(rwButton, 'active')) {
      opts.push('-w');
    }
    if (!hasClass(strButton, 'active')) {
      opts.push('-z');
    }
    if (!hasClass(binButton, 'active')) {
      opts.push('-n');
    }
    if (hasClass(analButton, 'active')) {
      opts.push('-AA');
    }
    openFile(opts);
  };
  debugButton.onclick = () => {
    openFile(['-d']);
  };
  document.ondragover = (ev) => {
    ev.preventDefault();
  };
  document.ondrop = (ev) => {
    ev.preventDefault();
    const path = ev.dataTransfer.files[0].path;
    electron.ipcRenderer.send('ondragstart', path);
  };

  let openInProgress = false;
  document.body.ondrop = (ev) => {
    ev.preventDefault();
    if (openInProgress) {
      return;
    }
    openInProgress = true;
    const path = ev.dataTransfer.files[0].path;
    electron.ipcRenderer.send('ondragstart', path);
  };
});

function showError (msg) {
  electron.remote.dialog.showErrorBox(msg, 'Error');
}

electron.ipcRenderer.on('show-error', (event, arg) => {
  showError(arg);
});

electron.ipcRenderer.on('open-page', (event, arg) => {
  openShell();
});

electron.ipcRenderer.on('focus', (event) => {
  const fileInput = document.getElementById('file-input');
  fileInput.focus();
});

  if (openDevTools) {
    electron.remote.getCurrentWindow().webContents.openDevTools();
  }

function openShell () {
  document.location.href = 'shell.html';

/*
  //  electron.shell.openExternal('shell.html');
  document.body.style.cursor = 'wait';
  const shellIframe = document.getElementById('shell-iframe');
  const shellWindow = document.getElementById('shell-window');
  shellIframe.src = '';
  shellWindow.style.zIndex = 1000;
  // shellWindow.style.visibility = 'visible';
  shellIframe.style.visibility = 'visible';
  shellWindow.style.opacity = 0;
  shellIframe.src = 'shell.html';
  shellWindow.style.transition = 'opacity 0.5s';
  shellWindow.style.width = '100%';
  shellWindow.style.heigth = '100%';
  shellIframe.style.width = '100%';
  shellIframe.style.heigth = '100%';
  shellIframe.allowpopups = true;
  shellIframe.setAttribute('nodeintegration', '');
  shellIframe.setAttribute('disablewebsecurity', '');
  shellIframe.setAttribute('allowpopups', '');
  shellIframe.require = window.require;
  shellIframe.require = window.require;
  shellIframe.isInitialized = false;
  if (!shellIframe.isInitialized) {
    shellIframe.isInitialized = true;
    shellIframe.addEventListener('dom-ready', () => {
      const src = shellIframe.src;
      if (src === '') {
        return;
      }
      document.body.style.cursor = 'default';
      if (shellIframe.src.indexOf('index.html') !== -1) {
        setTimeout(function () {
          shellWindow.style.zIndex = -1000;
        }, 1000);
        shellWindow.style.opacity = 0;
  //      shellWindow.style.visibility = 'hidden';
      } else {
        shellWindow.style.zIndex = 1000;
        shellWindow.style.opacity = 1;
  // shellIframe.openDevTools();
      }
    });
  }
*/
}
