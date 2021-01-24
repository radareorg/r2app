// web/agent

const openButton = document.querySelector('.button');
const electron = require('electron');
const packageJson = require('./package.json');
const rasm2 = require('./p/rasm2');

forceDefaultZoom();

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
      let str = ''; // <label>Sessions</label>\n';
      str += '<ul class="list-group">';
      for (const ses of list) {
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

// r2app api
function openProject (prj) {
  const opts = [];
  opts.push('-p');
  $('file-input').value = prj;
  openFile(opts);
}

function removeProject (prj) {
  ipcRenderer.invoke('r2rmProject', cmd);
  refreshProjects();
}

// r2app api
function openFile (opts) {
  electron.ipcRenderer.send('open-file', {
    path: $('file-input').value || '/bin/ls', options: opts
  });
}

function toggleTheme () {
  const bg = $('bg');
  bg.style['background-color'] = 'black !important';
}

function projectColor (p) {
  function colorseed (p) {
    let s = 0xa71320;
    for (const c of p) {
      s <<= 3;
      s ^= c.charCodeAt(0);
    }
    return s;
  }
  const seed = colorseed(p);
  function colorchar (n) {
    let ch = (seed >> n) & 0xf;
    if (ch < 8) {
      ch = 8;
    }
    return '0123456789abcdef'[ch];
  }
  const colors = [];
  colors.push(colorchar(0));
  colors.push(colorchar(3));

  colors.push(colorchar(6));
  colors.push(colorchar(9));

  colors.push(colorchar(12));
  colors.push(colorchar(15));

  colors.push(colorchar(18));
  colors.push(colorchar(21));
  return '#' + colors.join('');
}

function refreshProjects () {
  r2.projects().then((projects) => {
    let s = '';
    for (const prj of projects) {
      const c = projectColor(prj);
      const d = projectColor(prj.split('').reverse().join(''));
      s += `
<a onclick=openProject('` + prj + `')>
  <li class="list-group-item hlhover">
    <!--img class="img-circle media-object pull-left" style="background-color:` + c + `;padding:20" width="32" height="32" -->
    <img class="img-circle hlhover media-object pull-left" style="background-image:linear-gradient(` + c + ', ' + d + `);padding:20" width="32" height="32">
    <div class="media-body hlhover">
      <strong class="hlhover">` + prj + `</strong>
      <p class="hlhover">Description: </p>
    </div>
<a onclick=removeProject('` + prj + `')>
<div id=removeP0 class="hlhover" style="position:absolute;margin-top:-32px;right:32px">
<span class="icon icon-cancel hover"></span>
</div>
</a>
  </li>
</a>
`;
    }
    $('projects-list').innerHTML = s;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const logoImage = document.getElementById('logo-image');
  logoImage.onclick = toggleTheme;

  refreshProjects();

  electron.ipcRenderer.on('version', (event, arg) => {
    try {
      const r2version = document.getElementById('r2version');
      r2version.innerHTML = arg.result;
    } catch (e) {
      alert(e);
    }
  });
  electron.ipcRenderer.send('version');
  function filebutton_onclick () {
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
  }

  $('file-input').addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      filebutton_onclick();
    }
  });
  const fileButton = document.getElementById('file-button');
  const helpButton = $('help-button');
  const etcButton = document.getElementById('etc-button');
  const updateButton = document.getElementById('update-button');
  const updateWindow = document.getElementById('update-window');
  const aboutButton = document.getElementById('about-button');
  const debugButton = document.getElementById('debug-button');
  const homeButton = document.getElementById('home-button');
  const rwButton = document.getElementById('rw-button');
  const binButton = document.getElementById('bin-button');
  const r2appVersion = document.getElementById('r2app-version');
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

  r2appVersion.innerHTML = packageJson.version;
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
  updateButton.onclick = () => {
    updateWindow.style.visibility = 'visible';
    updateWindow.style.zIndex = 1000;
  };
  etcButton.onclick = () => {
    electron.ipcRenderer.invoke('select-file', {
      properties: ['openFile']
    }).then((res) => {
      const path = res.filePaths[0];
      if (typeof path !== 'undefined') {
        $('file-input').value = path;
      }
    }).catch((e) => {
      alert('error: ' + e);
    });
  };
  $('help-button').onclick = () => {
    r2.plugins('io').then((res) => {
      alert(res.join('\n'));
    });
  };
  fileButton.onclick = () => {
    filebutton_onclick();
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
  electron.dialog.showErrorBox(msg, 'Error');
}

electron.ipcRenderer.on('show-error', (event, arg) => {
  showError(arg);
});

electron.ipcRenderer.on('open-page', (event, arg) => {
  openShell();
});

electron.ipcRenderer.on('focus', (event) => {
  $('file-input').focus();
});

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
