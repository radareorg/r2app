const openDevTools = false;

const electron = require('electron');
const dialogs = require('dialogs');
const { Menu, MenuItem } = electron;

forceDefaultZoom();

function clearHits () {
  electron.ipcRenderer.send('run-command', 'f-hit*');
}

const viewButtons = [
  'label-pic-button',
  'label-hex-button',
  'label-dis-button',
  'label-dec-button',
  'label-gph-button'
];

const blackTheme = 'white';
const whiteTheme = 'twilight';

let clearScreen = false;
let prependScreen = false;
const hexCommand = 'pxc';
const eyeCommand = 'prc 4096@e:hex.cols=32';
let printCommand = 'pd|H';
let listCommand = 'flags';
let filterWord = '';
let seekHistory = false;
let dashboardMode = false;

function searchtap (pos) {
  electron.ipcRenderer.send('run-command', 'pd @' + pos + '|H');
}

function analyze () {
  clearScreen = true;
  desync(r2.cmd('af;' + printCommand));
}

function up () {
  clearScreen = true;
  prependScreen = true;
  electron.ipcRenderer.send('run-command', 's--;' + printCommand);
}

function down () {
  clearScreen = true;
  prependScreen = true;
  electron.ipcRenderer.send('run-command', 's++;' + printCommand);
}

/*
function createMenu () {
  const menu = new Menu();
  const text = window.getSelection().toString();
  if (!hasClass($('console-tab'), 'active')) {
    return;
  }
  if (text !== false) {
    const shortText = text.substring(0, 16) + ((text.length > 16) ? '...' : '');
    menu.append(new MenuItem({
      label: 'Set flag',
      click () {
        clearScreen = true;
        dialogs().prompt('Set flag at ' + shortText, '', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 'f ' + name + '=' + text + ';' + printCommand);
          }
        });
      }
    }));
    menu.append(new MenuItem({
      label: 'Add Comment',
      click () {
        clearScreen = true;
        dialogs().prompt('Comment', '', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 'CC ' + name + '@ ' + shortText + ';' + printCommand);
          }
        });
      }
    }));
    // in hexdump
    // if (hasClass(labelHexButton, 'active')) {
    menu.append(new MenuItem({
      label: 'Show flags',
      click () {
        clearScreen = true;
        electron.ipcRenderer.send('run-command', printCommand = 'pxa|H');
      }
    }));
    // }
    if (text.length > 1) {
      menu.append(new MenuItem({
        label: 'Add comment',
        click () {
          clearScreen = true;
          dialogs().prompt('Comment at ' + shortText, '', (name) => {
            if (name) {
              electron.ipcRenderer.send('run-command', 'CC ' + name + '=' + text + ';' + printCommand);
            }
          });
        }
      }));
      menu.append(new MenuItem({
        label: 'Seek to ' + shortText,
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', 's ' + text + ';' + printCommand);
        }
      }));
      menu.append(new MenuItem({
        label: 'Analyze at ' + shortText,
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', 's ' + text + ';af;' + printCommand);
        }
      }));
      menu.append(new MenuItem({
        label: 'Find references',
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', '/r ' + text + ';pd|H');
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }
  }
  menu.append(new MenuItem({
    label: 'Undefine',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'af-;f-;' + printCommand);
    }
  }));
  menu.append(new MenuItem({
    label: 'Analyze Function',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'af;' + printCommand);
    }
  }));
  menu.append(new MenuItem({
    label: 'Rename Function',
    click () {
      clearScreen = true;
      dialogs().prompt('New function name', '', (name) => {
        if (name) {
          electron.ipcRenderer.send('run-command', 'afn ' + name + ';fr ' + name + ';' + printCommand);
        }
      });
    }
  }));

  menu.append(new MenuItem({ type: 'separator' }));

  menu.append(new MenuItem({
    label: 'Entropy bars',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'p==e|H');
    }
  }));

  menu.append(new MenuItem({ type: 'separator' }));

  menu.append(new MenuItem({
    label: 'Change blocksize',
    click () {
      clearScreen = true;
      dialogs().prompt('Block size', '', (name) => {
        if (name) {
          electron.ipcRenderer.send('run-command', 'b ' + name + ';' + printCommand);
        }
      });
    }
  }));
  menu.append(new MenuItem({
    label: 'Toggle bytes',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!asm.bytes;pd|H');
    }
  }));
  menu.append(new MenuItem({
    label: 'Toggle color',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!scr.color;pd|H');
    }
  }));
  menu.append(new MenuItem({ type: 'separator' }));
  // debugger
  menu.append(new MenuItem({
    label: 'Add breakpoint',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!scr.color;pd|H');
    }
  }));
  return menu;
}
*/

/*
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  electron.ipcRenderer.send('create-panel-menu');
  // const menu = createMenu();
  // menu.popup(electron.remote.getCurrentWindow());
}, false);
*/

function loadPluginTabs () {
  r2app.tabAdd('r2frida', `<h1>R2Frida</h1>
hello world
`);
}

function linkify (a) {
  return a.split(/\n/g)
    .map(_ => _.replace(/0x([^\s]*)/, '<a href="javascript:searchtap(0x$1)">0x$1</a>'))
    .map(_ => _.replace(/sym\.([^\s]*)/, '<a href="javascript:searchtap(\'sym.$1\')">sym.$1</a>'))
    .map(_ => _.replace(/fcn\.([^\s]*)/, '<a href="javascript:searchtap(\'fcn.$1\')">fcn.$1</a>'))
    .map(_ => _.replace(/str\.([^\s]*)/, '<a href="javascript:searchtap(\'fcn.$1\')">str.$1</a>'))
    .join('\n');
}

function clickrow (name) {
  const isDarkTheme = ($('console-div').style.backgroundColor !== 'white');
  const k = (isDarkTheme) ? '#505050' : '#d0d0f0';
  $('row-' + name).style.backgroundColor = k;
}

function seekTo (addr) {
  clearScreen = true;
  electron.ipcRenderer.send('run-command', 's ' + addr + ';' + printCommand);

  seekHistory = true;
  electron.ipcRenderer.send('run-command', 'sj|');
  /*
<div class="label"> entry0 </div>
&#8827;
<div class="label"> main </div>
&#8827;
<div class="label"> sym.func.1000043f1 </div>
*/
}
document.addEventListener('DOMContentLoaded', function () {
  const entryInput = $('entry-input');
  const searchInput = $('search-input');
  const consoleDiv = $('console-div');
  const dashboardDiv = $('dashboard-div');
  const scriptingWin = $('scripting-window');
  const scriptingDiv = $('scripting-div');
  const scriptingDiv2 = $('scripting-div2');
  const searchConsole = $('search-console');
  const searchViewer = $('search-viewer');
  const labelsTable = $('labels');
  const notesText = $('notes-text');

  loadPluginTabs();

  $('sidebar-handle').onmousedown = handleDragStart;
  function handleDragMove (e) {
    e.preventDefault();
    if (e.clientX > 32) {
      $('sidebar-handle').style.left = e.clientX - 2;
      $('sidebar').style['min-width'] = e.clientX + 3;
      $('sidebar').style.width = e.clientX + 3;
    }
  }
  function handleDragStop (e) {
    $('sidebar-handle').style['background-color'] = '#ddd';
    document.onmousemove = null;
    document.onmouseup = null;
  }
  function handleDragStart (e) {
    e.preventDefault();

    document.onmousemove = handleDragMove;
    document.onmouseup = handleDragStop;
  }
  function handleDragEnd () {
  }

  // render dashboard
  dashboardMode = true;
  electron.ipcRenderer.send('run-command', 'o;?e Entropy:;p==e;om;i');

  consoleDiv.onmouseup = function () {
    const text = window.getSelection().toString();
    if (text.startsWith('0x')) {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 's ' + text + ';' + printCommand);
      seekHistory = true;
      electron.ipcRenderer.send('run-command', 'sj|');
    }
  };

  electron.ipcRenderer.on('focus', (event) => {
    entryInput.focus();
  });

  function decimalToHexString (number) {
    if (number !== +number) {
      return number;
    }
    if (number < 0) {
      number = 0xFFFFFFFF + number + 1;
    }
    return '0x' + number.toString(16);
  }

  electron.ipcRenderer.send('run-command', 'b 1024;e emu.str=true;e scr.color=3;e scr.html=true');
  electron.ipcRenderer.send('run-command', 'o;i');
  electron.ipcRenderer.send('run-command', '?E Welcome to r2app');

  function labelNew (name, addr) {
    if (filterWord) {
      if (name.indexOf(filterWord) === -1) {
        return '';
      }
    }
    addr = decimalToHexString(addr);
    return `
    <tr class="clickableLabel">
      <td id="row-${addr}" class="row">${addr}</td>
      <td id="row-${name}-${addr}" class="row">${name}</td>
    </tr>
`;
  }

  function updateLinks () {
    const anchors = document.getElementsByClassName('clickableLabel');
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const isDarkTheme = (consoleDiv.style.backgroundColor !== 'white');
      if (isDarkTheme) {
        anchor.style.color = '#f0f0f0';
        anchor.style.backgroundColor = '#101010';
      } else {
        anchor.style.color = '#101010';
        anchor.style.backgroundColor = 'white';
      }
      anchor.style.transition = 'all 0.5s ease-in';
      anchor.onclick = function (ev) {
        if (isDarkTheme) {
          ev.target.style.backgroundColor = '#505050';
        } else {
          ev.target.style.backgroundColor = '#d0d0f0';
        }
        clickrow(ev.target.id.split('-')[2].replace('row-', ''));
        seekTo(ev.target.innerHTML);
      };
    }
  }

  function labelReset () {
    labelsTable.innerHTML = '';
  }

  function labelLoadFunctions () {
    electron.ipcRenderer.send('list', listCommand);
  }

  function labelLoadFlags () {
    electron.ipcRenderer.send('list', listCommand = 'flags');
  }

  function b64DecodeUnicode (str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  electron.ipcRenderer.on('list', (event, arg) => {
    let str = '';
    const data = arg.data.reverse();
    // arg = JSON.parse(jso2jsonstr(arg));
    switch (arg.type) {
      case 'imports':
        if (data instanceof Array) {
          for (const f of data) {
            str += labelNew(f.name, f.ordinal); // f.type + ' ' + f.bind);
          }
        } else {
          if (Object.keys(data).length !== 0) {
            alert('Unexpected type: ' + JSON.stringify(data));
          }
        }
        break;
      case 'strings':
        for (const f of data) {
          const name = f.string;
          str += labelNew(name, f.vaddr);
        }
        break;
      case 'flags':
      case 'fcns':
        for (const f of data) {
          str += labelNew(f.name, f.offset);
        }
        break;
      case 'maps':
        for (const f of data) {
          str += labelNew(f.name + ' (' + f.perm + ')', f.from);
        }
        break;
      case 'files':
        for (const f of data) {
          str += labelNew(f.uri, f.size);
        }
        break;
      case 'methods':
        for (const klass of data) {
          for (const method of klass.methods) {
            const name = klass.classname + '.' + method.name;
            const addr = method.addr;
            str += labelNew(name, addr);
          }
        }
        break;
      case 'symbols':
        for (const f of data) {
          str += labelNew('sym.' + f.name, f.offset || f.vaddr);
        }
        break;
      case 'comments':
        for (const f of data) {
          if (f.type === 'CCu') {
            str += labelNew('sym.' + f.name, f.offset || f.vaddr);
          }
        }
        break;
      case 'regs':
      case 'sections':
        for (const f of data) {
          str += labelNew(f.name, f.offset || f.vaddr);
        }
        break;
      default:
        alert(JSON.stringify(arg.type));
        break;
    }
    labelsTable.innerHTML = str;
    updateLinks();
  });

  labelLoadFlags();

  entryInput.focus();
  document.ondragover = (ev) => {
    ev.preventDefault();
  };
  document.ondrop = (ev) => {
    ev.preventDefault();
    const path = ev.dataTransfer.files[0].path;
    electron.ipcRenderer.send('ondragstart', path);
  };

  function lightify (e) {
    e.style.transition = 'all 0.2s ease-in';
    e.style.color = 'black';
    e.style.backgroundColor = 'white';
  }
  function darkify (e) {
    e.style.transition = 'all 0.2s ease-in';
    e.style.color = '#f0f0f0';
    e.style.backgroundColor = '#101010';
  }
  function toggleTheme () {
    const isWhiteTheme = (consoleDiv.style.backgroundColor !== 'white');
    clearScreen = true;
    if (isWhiteTheme) {
      electron.ipcRenderer.send('run-command', 'eco ' + blackTheme + ';' + printCommand);
      lightify(consoleDiv);
      lightify(entryInput);
      lightify(labelsTable);
      lightify(searchInput);
      lightify(dashboardDiv);
      lightify(scriptingWin);
      lightify(notesText);
      lightify(searchConsole);
      lightify(searchViewer);
      lightify(scriptingDiv);
      lightify($('scripting-text'));
      scriptingDiv.style.color = '#303030';
      scriptingDiv.style.backgroundColor = '#c0c0c0';
      scriptingDiv2.style.color = 'black';
      scriptingDiv2.style.backgroundColor = '#d0d0d0';
    } else {
      electron.ipcRenderer.send('run-command', 'eco ' + whiteTheme + ';' + printCommand);
      darkify(consoleDiv);
      darkify(entryInput);
      darkify(labelsTable);
      darkify(notesText);
      darkify(searchInput);
      darkify(searchConsole);
      darkify(searchViewer);
      darkify(scriptingDiv);
      darkify(scriptingDiv2);
      darkify($('scripting-text'));
      dashboardDiv.style.color = 'white';
      dashboardDiv.style.backgroundColor = '#101010';
      scriptingDiv2.style.backgroundColor = '#404040';
      scriptingWin.style.color = 'white';
      scriptingWin.style.backgroundColor = '#101010';
    }
    updateLinks();
  }
  toggleTheme();

  function submitCommand () {
    const command = entryInput.value;
    switch (command) {
      case 'cls':
      case 'clear':
        consoleDiv.innerHTML = '';
        break;
      case 'bg':
        toggleTheme();
        break;
      default:
        electron.ipcRenderer.send('run-command', 'e scr.html=true;' + command);
        break;
    }
    // alert(entryInput.value);
    entryInput.value = '';
  }

  electron.ipcRenderer.on('seek-next', (event) => {
    electron.ipcRenderer.send('run-command', 'sn;' + printCommand);
  });
  electron.ipcRenderer.on('seek-prev', (event) => {
    electron.ipcRenderer.send('run-command', 'sp;' + printCommand);
  });
  electron.ipcRenderer.on('filter-list', (event, arg) => {
    filterList();
  });
  electron.ipcRenderer.on('open-tab', (event, arg) => {
    // TODO . use r2app.tabs array
    switch (arg.name) {
      case 'goto':
        dialogs().prompt('Goto address or flag...', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 's ' + name + ';' + printCommand);
            seekHistory = true;
            electron.ipcRenderer.send('run-command', 'sj|');
          }
        });
        break;
      case 1:
        r2app.resetTabs();
        addClass(consoleTab, 'active');
        break;
      case 2:
        r2app.resetTabs();
        addClass(dashboardTab, 'active');
        if (dashboardWindow) {
          dashboardWindow.style.visibility = 'visible';
        }
        break;
      case 3:
        r2app.resetTabs();
        addClass(searchTab, 'active');
        if (searchWindow) {
          searchWindow.style.visibility = 'visible';
        }
        break;
      case 4:
        r2app.resetTabs();
        addClass(scriptingTab, 'active');
        if (scriptingWindow) {
          scriptingWindow.style.visibility = 'visible';
        }
        break;
      case 5:
        r2app.resetTabs();
        addClass(notesTab, 'active');
        if (notesWindow) {
          notesWindow.style.visibility = 'visible';
        }
        break;
    }
  });
  electron.ipcRenderer.on('command-output', (event, arg) => {
    if (dashboardMode) {
      dashboardDiv.innerHTML = arg.result.trim();
      dashboardMode = false;
    }
    if (seekHistory && arg.command === 'sj|') {
      seekHistory = false;
      const sh = $('seek-history');
      try {
        var hist = JSON.parse(arg.result.trim());
      } catch (e) {
        alert('' + e);
        alert(arg.result.trim());
      }
      let res = '';
      for (const h of hist) {
        if (!h.offset) {
          continue;
        }
        const label = '0x' + h.offset.toString(16);
        if (!h.name) {
          h.name = label;
        }
        if (res.length !== 0) {
          res += '&#8827;';
        }
        res += '<div onclick="seekTo(\'' + label + '\')" title="' + label + '" class="label">' + h.name + '</div>';
      }
      sh.innerHTML = res;
      sh.scrollLeft = sh.scrollWidth - sh.clientWidth;
      return;
    }
    if (arg.command.startsWith('e scr.html=true')) {
      arg.command = arg.command.substring(16);
    }
    if (arg.command.indexOf('agf') != -1 || arg.command.indexOf('pdc') != -1) {
      if (arg.result.trim() === '') {
        arg.result = '<br />No function found.<br /><br/>Click <a href="javascript:analyze()">here</a> to analyze.';
      } else {
        arg.result = linkify(arg.result);
      }
    }
    if (hasClass(searchTab, 'active')) {
      if (arg.command.startsWith('/')) {
        const res = linkify(arg.result);
        // ;escapeHtml(arg.result).split(/\n/g).map(_ => _.replace(/0x([^\s]*)/, '<a href="javascript:searchtap(0x$1)">0x$1</a>')).join('\n');
        searchConsole.innerHTML = res;
      } else {
        searchViewer.scrollLeft = 0;
        searchViewer.scrollTop = 0;
        searchViewer.innerHTML = '<pre class="pre">' + arg.result + '</pre>';
      }
    } else if (clearScreen) {
      // consoleDiv.innerHTML = '<a href="javascript:up()">[^]</a><b>&gt; ' + arg.command + '</b>\n' + arg.result;
      consoleDiv.innerHTML = '<div id="updown" style="position:fixed;z-index:1000;top:90px;right:5px">' +
        '<button onclick="javascript:up()" id="label-up" class="btn btn-default"><span class="icon icon-up"></span></button>' +
        '<button onclick="javascript:down()" id="label-up" class="btn btn-default"><span class="icon icon-down"></span></button>' +
        '</div>\n' + arg.result;
      //  clearScreen = false;
      if (prependScreen) {
        consoleDiv.scrollLeft = 0;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        prependScreen = false;
      } else {
        consoleDiv.scrollLeft = 0;
        consoleDiv.scrollTop = 0;
      }
    } else {
      if (prependScreen) {
        consoleDiv.innerHTML = arg.result + '<br />' + consoleDiv.innerHTML;
        consoleDiv.scrollLeft = 0;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
      } else {
        consoleDiv.innerHTML += '<b>&gt; ' + arg.command + '</b>\n' + arg.result;
      }
      consoleDiv.scrollLeft = 0;
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
      prependScreen = false;
      clearScreen = false;
    }
  });

  let longtimer = null;

  function onlongpress (name, cb) {
    const x = document.getElementById(name);
    x.onmouseup = function () {
      if (longtimer !== null) {
        clearTimeout(longtimer);
      }
    };

    x.onmousedown = function () {
      if (longtimer !== null) {
        clearTimeout(longtimer);
      }
      longtimer = setTimeout(function () {
        longtimer = null;
        cb();
      }, 1000);
    };
  }

  function onclick (name, cb) {
    const x = document.getElementById(name);
    x.onclick = cb;
  }

  onclick('seek-back', _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 's-;' + printCommand);
    seekHistory = true;
    electron.ipcRenderer.send('run-command', 'sj|');
  });
  onclick('seek-reset', _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 's-*;' + printCommand);
    seekHistory = true;
    electron.ipcRenderer.send('run-command', 'sj|');
  });
  onclick('seek-fwd', _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 's+;' + printCommand);
    seekHistory = true;
    electron.ipcRenderer.send('run-command', 'sj|');
  });
  onlongpress('af-button', _ => {
    dialogs().confirm('Analyze all the program?', '', so => {
      if (so) {
        clearScreen = true;
        electron.ipcRenderer.send('run-command', 'aaa;' + printCommand);
      }
    });
  });
  onclick('af-button', _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'af;' + printCommand);
  });
  onclick('uf-button', _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'af-;f-;' + printCommand);
  });
  onlongpress('uf-button', _ => {
    dialogs().confirm('Undefine all analysis', '', so => {
      if (so) {
        clearScreen = true;
        electron.ipcRenderer.send('run-command', 'af-*;f-hit*;' + printCommand);
      }
    });
  });
  onclick('cm-button', _ => {
    clearScreen = true;
    dialogs().prompt('Comment', '', (name) => {
      if (name) {
        electron.ipcRenderer.send('run-command', 'CC ' + name + ';' + printCommand);
      }
    });
  });
  onclick('dt-button', _ => {
    clearScreen = true;
    dialogs().prompt('Data Size', '', (sz) => {
      if (name) {
        electron.ipcRenderer.send('run-command', 'Cd ' + sz + '@ ' + shortText + ';' + printCommand);
      }
    });
  });

  onclick('heart-button', () => {
    alert('Visit https://www.radare.org/ for more details');
  });
  onclick('pencil-button', () => {
    dialogs().prompt('Write "text" or hexpairs', (name) => {
      if (name) {
        if (name[0] === '"') {
          electron.ipcRenderer.send('run-command', 'w ' +
            name.substring(1, name.length - 1) + ';' + printCommand);
        } else {
          electron.ipcRenderer.send('run-command', 'wx ' + name + ';' + printCommand);
        }
      }
    });
  });

  onclick('feather-button', () => {
    dialogs().prompt('Write "text" or hexpairs', (name) => {
      if (name) {
        if (name[0] === '"') {
          electron.ipcRenderer.send('run-command', 'w ' +
            name.substring(1, name.length - 1) + ';' + printCommand);
        } else {
          electron.ipcRenderer.send('run-command', 'wx ' + name + ';' + printCommand);
        }
      }
    });
  });

  onclick('copy-button', () => {
    dialogs().prompt('How many bytes to copy?', (name) => {
      if (name) {
        electron.ipcRenderer.send('run-command', 'y ' + name + ';' + printCommand);
      }
    });
  });
  onclick('paste-button', () => {
    electron.ipcRenderer.send('run-command', 'yy;' + printCommand);
  });

  onclick('prefs-button', _ => {
    electron.ipcRenderer.send('open-settings');
  });

  const helpButton = document.getElementById('help-button');
  helpButton.onclick = _ => {
    alert('r2app - by pancake@nopcode.org\n\n' +
    'Cmd + [1-9] - change tab\n' +
    'Cmd + G     - goto address/symbol\n' +
    'Cmd + F     - filter side panel list\n' +
    'Cmd + N / P - seek to next or previous (e scr.nkey, sn, sp)\n' +
    'Cmd + T     - tab a new window\n' +
    'Cmd + L     - focus command input\n' +
    // 'Cmd + O     - open file\n' +
    'Cmd + W     - close window\n');
  };
  const lightButton = document.getElementById('light-button');
  lightButton.onclick = _ => {
    toggleTheme();
  };
  const stepButton = document.getElementById('step-button');
  stepButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'ds;' + printCommand);
  };
  const stepoverButton = document.getElementById('stepover-button');
  stepoverButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'dso;' + printCommand);
  };
  /// // labels buttons ////
  const labelRefreshButton = document.getElementById('label-refresh-button');
  const labelMenuButton = document.getElementById('label-menu-button');
  const labelSearchButton = document.getElementById('label-search-button');
  const labelPicButton = document.getElementById('label-pic-button');
  const labelHexButton = document.getElementById('label-hex-button');
  const labelDisButton = document.getElementById('label-dis-button');
  const labelDecButton = document.getElementById('label-dec-button');
  const labelGphButton = document.getElementById('label-gph-button');
  const labelAddButton = document.getElementById('label-add-button');
  const labelDelButton = document.getElementById('label-del-button');

  const consoleTab = document.getElementById('console-tab');
  const dashboardTab = document.getElementById('dashboard-tab');
  const searchTab = document.getElementById('search-tab');
  const scriptingTab = document.getElementById('scripting-tab');
  const notesTab = document.getElementById('notes-tab');

  const consoleWindow = document.getElementById('console-window');
  const dashboardWindow = document.getElementById('dashboard-window');
  const searchWindow = document.getElementById('search-window');
  const scriptingWindow = document.getElementById('scripting-window');
  const notesWindow = document.getElementById('notes-window');

  labelRefreshButton.onclick = _ => {
    filterWord = undefined;
    labelLoadFunctions();
  };

  labelAddButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'af;' + printCommand);
  };

  labelDelButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', 'af-;f-;' + printCommand);
  };

  labelMenuButton.onclick = _ => {
    electron.ipcRenderer.send('create-panel-menu');
  };

  labelSearchButton.onclick = _ => {
    filterList();
  };

  function filterList () {
    const x = labelSearchButton;
    dialogs().prompt('Filter list', (name) => {
      if (name) {
        filterWord = name;
        labelLoadFunctions();
        if (!hasClass(x, 'active')) {
          addClass(x, 'active');
        }
      } else {
        removeClass(x, 'active');
        labelRefreshButton.onclick();
      }
    });
  }
  // when all tabs are geneated with r2app.tabAdd() we can remove this hardcoding
  r2app.tabs = [
    'console',
    'dashboard',
    'scripting',
    'notes',
    'search',
    'r2frida'
  ];
  scriptingTab.onclick = () => {
    r2app.resetTabs();
    addClass(scriptingTab, 'active');
    if (scriptingWindow) {
      scriptingWindow.style.visibility = 'visible';
    }
  };
  consoleTab.onclick = () => {
    r2app.resetTabs();
    addClass(consoleTab, 'active');
    if (consoleDiv) {
      consoleDiv.style.visibility = 'visible';
    }
  };
  dashboardTab.onclick = () => {
    r2app.resetTabs();
    addClass(dashboardTab, 'active');
    $('dashboard-window').style.visibility = 'visible';
  };
  notesTab.onclick = () => {
    r2app.resetTabs();
    addClass(notesTab, 'active');
    if (notesWindow) {
      notesWindow.style.visibility = 'visible';
      $('notes-text').focus();
    }
  };
  searchTab.onclick = () => {
    r2app.resetTabs();
    addClass(searchTab, 'active');
    $('search-input').focus();
    if (searchWindow) {
      searchWindow.style.visibility = 'visible';
    }
  };

  function resetViewButtons () {
    for (const button of viewButtons) {
      removeClass($(button), 'active');
    }
  }

  labelPicButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = eyeCommand + '|H');
    resetViewButtons();
    addClass(labelPicButton, 'active');
  };
  labelHexButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = hexCommand + '|H');
    resetViewButtons();
    addClass(labelHexButton, 'active');
  };

  labelDisButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'pd|H');
    resetViewButtons();
    addClass(labelDisButton, 'active');
  };

  labelDecButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'pdsf;pdc|H');
    resetViewButtons();
    addClass(labelDecButton, 'active');
  };

  labelGphButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'agf|'); // No colors, but working links
    // electron.ipcRenderer.send('run-command', printCommand = 'agf|H'); COLOR
    resetViewButtons();
    addClass(labelGphButton, 'active');
  };

  const homeButton = document.getElementById('home-button');
  homeButton.onclick = _ => {
    location.href = 'index.html';
  };

  entryInput.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      submitCommand();
    }
  });

  searchInput.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      electron.ipcRenderer.send('run-command', 'e search.hits=false');
      electron.ipcRenderer.send('run-command', '/ ' + searchInput.value + '|');
      searchInput.value = '';
    }
  });
});
