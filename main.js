const { app, webView, ipcMain, BrowserWindow, globalShortcut, clipboard } = require('electron');
const localShortcut = require('electron-localshortcut');
const path = require('path');

const url = require('url');

const r2pipe = require('r2pipe');
const devConsole = false;

const windows = [];
let globalR2 = null;
let sessions = [];

app.commandLine.appendSwitch('--enable-viewport-meta', 'true');
app.commandLine.appendSwitch('--disable-pinch');

app.on('open-file', function (event, filePath) {
  event.preventDefault();
  console.log('app.on("open-file", ' + filePath + ')');
  openFile(filePath); //, event);
});

function openFile (targetFile, event) {
  let options = [];
  if (typeof targetFile === 'object') {
    options = targetFile.options || [];
    targetFile = targetFile.path || '/bin/ls';
  }
  console.log('openFile', targetFile);
  process.env.PATH = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:.';
  r2pipe.open(targetFile, options, (err, r2) => {
    if (err) {
      if (event && event.sender && event.sender.send) {
        event.sender.send('show-error', err.toString());
      }
      return console.error(err);
    }
    sessions.push({
      file: targetFile,
      r2: r2
    });
    globalR2 = r2;
    // TODO: register into the sessions manager
    r2.cmd('b 1024;e scr.utf8=true;e asm.bytes=false;e scr.color=true;e scr.html=true', (err, res) => {
      if (err) {
        if (event && event.sender && event.sender.send) {
          event.sender.send('show-error', err.toString());
        }
        console.error(err);
        return;
      }
      // :D
      // windows[0].hide();
      if (event && event.sender && event.sender.send) {
        event.sender.send('open-page', 'shell');
      } else {
        if (windows.length > 0) {
          windows[0].loadURL(url.format({
            pathname: path.join(__dirname, 'shell.html'),
            protocol: 'file:',
            slashes: true
          }));
        }
      }
    });
  });
}

function openSettings () {
  const win = new BrowserWindow({
    title: 'Settings',
    icon: path.join(__dirname, 'img/icon64.png'),
    backgroundColor: 'white',
    width: 400,
    height: 300,
    minWidth: 400,
    minHeight: 0,
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: 1.0
    },
    show: false
  });
  // win.once
  if (devConsole) {
    win.webContents.openDevTools();
  }
  win.on('ready-to-show', () => {
    win.show();
  });
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'prefs.html'),
    protocol: 'file:',
    slashes: true
  }));
  windows.push(win);
}

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    title: 'RadareApp',
    icon: path.join(__dirname, 'img/icon64.png'),
    backgroundColor: 'white',
    width: 800,
    height: 500,
    minWidth: 500,
    minHeight: 200,
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: 1.0
    }
  });
  /*
  // win.once
  win.on('ready-to-show', () => {
    win.show();
  });
*/
  windows.push(win);

  localShortcut.register(win, 'CommandOrControl+1', () => {
    win.webContents.send('open-tab', { name: 1 });
  });
  localShortcut.register(win, 'CommandOrControl+2', () => {
    win.webContents.send('open-tab', { name: 2 });
  });
  localShortcut.register(win, 'CommandOrControl+3', () => {
    win.webContents.send('open-tab', { name: 3 });
  });
  localShortcut.register(win, 'CommandOrControl+4', () => {
    win.webContents.send('open-tab', { name: 4 });
  });
  localShortcut.register(win, 'CommandOrControl+5', () => {
    win.webContents.send('open-tab', { name: 5 });
  });
  localShortcut.register(win, 'CommandOrControl+G', () => {
    win.webContents.send('open-tab', { name: 'goto' });
  });

  // globalShortcut.register('CommandOrControl+N', () => {
  localShortcut.register(win, 'CommandOrControl+N', () => {
    createWindow();
    // open file ?
  });

  // globalShortcut.register('CommandOrControl+O', () => {
  localShortcut.register(win, 'CommandOrControl+O', () => {
    console.log('CommandOrControl+O is pressed');
    // open file ?
  });

  // globalShortcut.register('CommandOrControl+L', () => {
  localShortcut.register(win, 'CommandOrControl+L', () => {
    win.webContents.send('focus');
    return true;
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.argv.length > 2) {
    openFile(process.argv[2]);
  }

  // and load the index.html of the app.
  /*
  console.log("1");
  win.send("open-page", 'nothing');
  console.log("2");
*/
  // Open the DevTools.
  if (devConsole) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = windows.pop();
    if (windows.length === 0) {
      app.quit();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/*
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // createWindow();
});
*/
ipcMain.on('open-file', function (event, arg) {
  openFile(arg || '/bin/ls', event);
});

ipcMain.on('open-settings', function (event, arg) {
  openSettings();
});

const exec = require('child_process').exec;

ipcMain.on('package-install', function (event, pkgName) {
  exec('r2pm -i ' + pkgName, (err, out) => {
    if (err) {
      console.error(err);
    }
    event.sender.send('done');
  });
});

ipcMain.on('package-update', function (event) {
  exec('r2pm update', (err, out) => {
    if (err) {
      console.error(err);
    }
    event.sender.send('done');
  });
});

ipcMain.on('package-uninstall', function (event, pkgName) {
  exec('r2pm -u ' + pkgName, (err, out) => {
    if (err) {
      console.error(err);
    }
    event.sender.send('done');
  });
});

ipcMain.on('package-list', function (event, arg) {
  windows[0].setTitle('Package Manager');
  const exec = require('child_process').exec;
  function execute (command, callback) {
    exec(command, function (error, stdout, stderr) { callback(erstdout); });
  }
  exec('r2pm -s', (err, out) => {
    if (err) {
      console.error(err);
    }
    exec('r2pm -l', (err, inst) => {
      if (err) {
        console.error(err);
      }
      const installed = {};
      for (const pkg of inst.split('\n')) {
        if (pkg) installed[pkg] = true;
      }
      const pkgs = [];
      for (const line of out.split('\n')) {
        const ns = line.indexOf(' ');
        const ts = line.indexOf(']');
        const pkgName = line.substring(0, ns).trim();
        pkgs.push({
          installed: installed[pkgName],
          name: pkgName,
          type: line.substring(ns + 1, ts + 1).trim(),
          desc: line.substring(ts + 1).trim()
        });
      }
      event.sender.send('packages', pkgs);
    });
  });
});

ipcMain.on('list', function (event, arg) {
  function cb (err, res) {
    if (err) {
      console.error(err);
      event.sender.send('show-error', err.toString());
    } else {
      event.sender.send('list', { type: arg, data: res });
    }
  }
  switch (arg) {
    case 'regs':
      globalR2.cmdj('drj|', cb);
      break;
    case 'comments':
      globalR2.cmdj('CCj|', cb);
      break;
    case 'fcns':
      globalR2.cmdj('aflj|', cb);
      break;
    case 'imports':
      globalR2.cmdj('iij|', cb);
      break;
    case 'strings':
      globalR2.cmdj('izj', cb);
      break;
    case 'regs':
      globalR2.cmdj('drj|', cb);
      break;
    case 'symbols':
      globalR2.cmdj('isj|', cb);
      break;
    case 'sections':
      globalR2.cmdj('iSj|', cb);
      break;
    case 'sessions':
      cb(null, { type: arg, data: { data: sessions } });
      break;
    default:
      globalR2.cmdj('e scr.html=0;fj|', (err, res) => {
        res = res.reverse();
        cb(err, res);
      });
      break;
  }
});

ipcMain.on('kill-session', (event, id) => {
  const i = Math.min(id, sessions.length);
  try {
    sessions[i].r2.quit(_ => {
      console.error('session closed');
    });
    const a = sessions.slice(0, i);
    const b = sessions.slice(i + 1);
    sessions = a.push(...b);
  } catch (e) {
    console.error(e);
  }
});

ipcMain.on('ondragstart', (event, filePath) => {
  openFile(filePath || '', event);
});

ipcMain.on('run-command', (event, arg) => {
  if (globalR2 !== null) {
    globalR2.cmd(arg, (err, res) => {
      if (err) {
        return event.sender.send('command-output', { command: arg, result: err.toString() });
      }
      event.sender.send('command-output', { command: arg, result: res });
    });
  }
});

ipcMain.on('version', (event, arg) => {
  r2pipe.syscmd('r2 -qv', (err, res) => {
    try {
      if (err) {
        throw err;
      }
      const version = res.trim();
      event.sender.send('version', { command: arg, result: version });
    } catch (e) {
      event.sender.send('version', { command: arg, result: e.toString() });
    }
  });
});
