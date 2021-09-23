// host/nodejs
const { setVisualZoomLimits, nativeTheme, ipcRenderer, app, dialog, webView, ipcMain, BrowserWindow, globalShortcut, clipboard } = require('electron');
const localShortcut = require('electron-localshortcut');
const path = require('path');
const os = require('os');
const { Menu, MenuItem } = require('electron');
const rasm2 = require('./ui/rasm2');

nativeTheme.themeSource = 'light';

let mainWindow = null;

const menu = Menu.buildFromTemplate([
  {
    label: 'r2app',
    submenu: [
      { label: 'Open File' },
      { type: 'separator' },
      { label: 'Export as .asm' },
      { label: 'Export as .c' },
      { label: 'Export as .hex' },
      { type: 'separator' },
      { role: 'close' },
      { role: 'quit' }
      // {label: 'About Me', selector: 'orderFrontStandardAboutPanel:'},
      // {label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() {force_quit=true; app.quit();}}
    ]
  }, {
    label: 'Edit',
    submenu: [
      { label: 'Cut' },
      { label: 'Copy' },
      { label: 'Paste' },
      { type: 'separator' },
      { label: 'Preferences' }
    ]
  }, {
    label: 'View',
    submenu: [
      { label: 'Landscape' }
    ]
  }, {
    label: 'Tools',
    submenu: [
      { label: 'rax2' },
      { label: 'r2pm' },
      { label: 'ragg2' },
      { label: 'rasm2', click: () => { openWindow('Rasm2', 'ui/rasm2/index.html'); } },
      { label: 'rabin2' },
      { label: 'rahash2' },
      { label: 'rasign2' },
      { label: 'rafind2' },
      { label: 'r2agent' },
      {
        label: 'doom',
        click: () => {
          const cfg = {
            titleBarStyle: 'default'
          };
          const w = openWindow('DOOM', 'ui/doom/index.html', cfg);
          const off = 30;
          const ww = 640 + (off / 2);
          const hh = 400 + off;
          w.setMinimumSize(ww, hh);
          w.setMaximumSize(ww, hh);
          w.setSize(ww, hh);
        }
      }
    ]
  }, {
    label: 'Window',
    submenu: [
      { label: 'Developer Tools' },
      { label: 'Close' }
    ]
  }, {
    label: 'Help',
    submenu: [
      { role: 'about' }
      // {label: 'About App', selector: 'orderFrontStandardAboutPanel:'},
      // {label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() {force_quit=true; app.quit();}}
    ]
  }]);
Menu.setApplicationMenu(menu);

ipcMain.handle('r2rmProject', (ev, cmd) => {
  return new Promise((resolve, reject) => {
    r2pipe.syscmd('r2', {}, (err, res) => {
      (err ? reject : resolve)(err);
    });
  });
});

ipcMain.handle('r2cmd', async (ev, cmd) => {
  return globalR2.cmd(cmd);
});
ipcMain.handle('projects', async (ev, cmd) => {
  return new Promise(function (resolve, reject) {
    r2pipe.syscmd('r2 -p', {}, (err, res) => {
      if (err) return reject(err);
      resolve(res.trim().split('\n'));
    });
  });
});
ipcMain.handle('plugins', async (ev, type) => {
  return new Promise(function (resolve, reject) {
    let cmd = 'r2 -L';
    switch (type) {
      case 'bin':
        cmd = 'rabin2 -L';
        break;
      case 'asm':
        cmd = 'rasm2 -L';
        break;
      case 'io':
        cmd = 'r2 -L';
        break;
    }
    r2pipe.syscmd(cmd, {}, (err, res) => {
      if (err) return reject(err);
      resolve(res.trim().split('\n'));
    });
  });
});

function jso2jsonstr (o) {
  const r = JSON.parse(JSON.stringify(o));
  // console.error(r);
  return r;
}

const url = require('url');

const r2pipe = require('r2pipe');
const devConsole = process.env.R2APP_DEBUG === '1';

const windows = [];
let globalR2 = null;
let sessions = [];

app.commandLine.appendSwitch('--enable-viewport-meta', 'true');
app.commandLine.appendSwitch('--disable-pinch');

ipcMain.handle('select-file', function (event, options) {
  event.preventDefault();
  return dialog.showOpenDialog(mainWindow, options);
});

app.on('open-file', function (event, filePath, options) {
  event.preventDefault();
  console.log('app.on("open-file", ' + filePath + ')');
  openFile({ path: filePath, opts: options }, event);
});

function openFile (targetFile, event) {
  let options = [];
  if (typeof targetFile === 'object') {
    options = targetFile.options || [];
    targetFile = targetFile.path || path.join(__dirname,'samples','ls');
  }
  console.log('openFile', targetFile, options);
  if (os.platform() !== 'win32') {
    process.env.PATH = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:.';
  }
  if (targetFile == '.') {
    return '';
  }
  const opts = [];
  let do_analysis = false;
  for (const opt of options) {
    if (opt === '-AA') {
      do_analysis = true;
    } else {
      opts.push(opt);
    }
  }
  r2pipe.open(targetFile, opts, (err, r2) => {
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
    if (do_analysis) {
      r2.cmd('aaa', (err, res) => {
        console.error('Analysis complete');
      });
    }
    r2.cmd('b 1024;e scr.utf8=true;e asm.bytes=false;e scr.color=3;e scr.html=true', (err, res) => {
      if (err) {
        if (event && event.sender && event.sender.send) {
          event.sender.send('show-error', err.toString());
        }
        console.error(err);
        return;
      }
      // :D
if (os.platform() === 'win32') {
// do nothing
} else {
if (windows.length > 0) {
  windows[0].hide();
 windows.shift()
  createWindow(true);
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

const isMac = process.platform === 'darwin';
const r2appIconPath = path.join(__dirname, isMac ? 'img/icon64.icns' : 'img/icon64.png');

// dupe of createWindow
function openWindow (title, file, options) {
  const cfg = {
    // useContentSize: true,
    title: title,
    icon: r2appIconPath,
    backgroundColor: 'white',
    width: 600,
    height: 500,
    minWidth: 400,
    minHeight: 300,
    // frame: false,
    titleBarStyle: 'hiddenInset', // TITLEBAR
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1.0
    },
    show: false
  };
  if (options) {
    for (const k of Object.keys(options)) {
      cfg[k] = options[k];
    }
  }
  const win = new BrowserWindow(cfg);
  const webContents = win.webContents;
  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1);
    webContents.setVisualZoomLevelLimits(1, 1);
    // webContents.setLayoutZoomLevelLimits(0, 0);
  });
  win.webContents.setZoomFactor(1.0);
  if (devConsole) {
    win.webContents.openDevTools();
  }
  win.on('ready', () => {
    win.center();
    win.show();
  });
  win.on('ready-to-show', () => {
    win.center();
    win.show();
  });
  win.loadURL(url.format({
    pathname: path.join(__dirname, file),
    protocol: 'file:',
    slashes: true
  }));
  windows.push(win);
  return win;
}

function createWindow (withFrame) {
  // Create the browser window.
  const windowOptions = {
    title: 'r2app',
    icon: r2appIconPath,
    backgroundColor: 'white',
    width: 1024,
    height: 600,
    minWidth: 500,
    minHeight: 200,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1.0
    }
  };
  if (!withFrame) {
    windowOptions.frame = false;
    windowOptions.titleBarStyle = 'hiddenInset'; // TITLEBAR
  }
  let win = new BrowserWindow(windowOptions);
  mainWindow = win;

      win.center();
if (os.platform() === 'win32') {
//win.show();
}
  // win.once
  win.on('ready-to-show', () => {
    // consider 1s enough time to be ready
    setTimeout(function () {
      win.show();
    }, 1000);
  });
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
  localShortcut.register(win, 'CommandOrControl+F', () => {
    win.webContents.send('filter-list', { name: 'word' });
  });

  localShortcut.register(win, 'CommandOrControl+T', () => {
    createWindow(false);
  });
  // globalShortcut.register('CommandOrControl+N', () => {
  localShortcut.register(win, 'CommandOrControl+N', () => {
    win.webContents.send('seek-next');
  });
  localShortcut.register(win, 'CommandOrControl+P', () => {
    win.webContents.send('seek-prev');
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
    // process.env['R2APP_DEBUG']
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = windows.pop();
    if (windows.length === 0) {
      app.quit();
    } else {
      console.error('There are running sessions, close them first');
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const needsWindowControls = os.platform() === 'win32';
  createWindow(needsWindowControls);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function createPanelMenu (event) {
  const electron = require('electron');
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Functions',
    click () {
      shell_list(event, 'fcns');
    }
  }));
  menu.append(new MenuItem({
    label: 'Symbols',
    click () {
      shell_list(event, 'symbols');
    }
  }));
  menu.append(new MenuItem({
    label: 'Maps',
    click () {
      shell_list(event, 'maps');
    }
  }));
  menu.append(new MenuItem({
    label: 'Files',
    click () {
      shell_list(event, 'files');
    }
  }));
  menu.append(new MenuItem({
    label: 'Class Methods',
    click () {
      shell_list(event, 'methods');
    }
  }));
  menu.append(new MenuItem({
    label: 'Imports',
    click () {
      shell_list(event, 'imports');
    }
  }));
  menu.append(new MenuItem({
    label: 'Sections',
    click () {
      shell_list(event, 'sections');
    }
  }));
  menu.append(new MenuItem({
    label: 'Registers',
    click () {
      shell_list(event, 'regs');
    }
  }));
  menu.append(new MenuItem({
    label: 'Comments',
    click () {
      shell_list(event, 'comments');
    }
  }));
  menu.append(new MenuItem({
    label: 'Flags',
    click () {
      shell_list(event, 'flags');
    }
  }));
  menu.append(new MenuItem({
    label: 'Strings',
    click () {
      shell_list(event, 'strings');
    }
  }));
  menu.append(new MenuItem({ type: 'separator' }));
  return menu;
}

ipcMain.on('create-panel-menu', function (event, arg) {
  const menu = createPanelMenu(event);
  menu.popup(mainWindow);
});

ipcMain.on('open-file', function (event, arg) {
  openFile(arg || '/bin/ls', event);
});

ipcMain.on('open-settings', function (event, arg) {
  openWindow('Settings', 'ui/settings/index.html');
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
  return shell_list(event, arg);
});

function shell_list (event, type) {
  function cb (err, res) {
    if (err) {
      console.error(err);
      event.sender.send('show-error', err.toString());
    } else {
      event.sender.send('list', { type: type, data: res });
    }
  }
  switch (type) {
    case 'maps':
      globalR2.cmdj('omj|', cb);
      break;
    case 'regs':
      globalR2.cmdj('drj|', cb);
      break;
    case 'comments':
      globalR2.cmdj('CCj|', cb);
      break;
    case 'fcns':
      globalR2.cmdj('aflj|', cb);
      break;
    case 'files':
      globalR2.cmdj('oj|', cb);
      break;
    case 'imports':
      globalR2.cmdj('iij|', cb);
      break;
    case 'strings':
      globalR2.cmdj('izj|', cb);
      break;
    case 'regs':
      globalR2.cmdj('drj|', cb);
      break;
    case 'methods':
      globalR2.cmdj('icj|', cb);
      break;
    case 'symbols':
      globalR2.cmdj('isj|', cb);
      break;
    case 'sections':
      globalR2.cmdj('iSj|', cb);
      break;
    case 'sessions':
      cb(null, { type: type, data: { data: jso2jsonstr(sessions) } });
      break;
    default:
      globalR2.cmdj('e scr.html=0;fj|', (err, res) => {
        res = res.reverse();
        cb(err, res);
      });
      break;
  }
}

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
  r2pipe.syscmd('r2 -qv', {}, (err, res) => {
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
