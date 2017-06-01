if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const electron = require('electron');
const dialogs = require('dialogs');
const {Menu, MenuItem} = electron.remote;

electron.webFrame.setVisualZoomLevelLimits(1, 1);
electron.webFrame.setLayoutZoomLevelLimits(0, 0);

var clearScreen = false;
var prependScreen = false;
var hexCommand = 'pxc';
var printCommand = 'pd|H';
var listCommand = 'fcns';
var filterWord = '';

function analyze () {
  clearScreen = true;
  electron.ipcRenderer.send('run-command', 'af;' + printCommand);
}

function up () {
  clearScreen = true;
  prependScreen = true;
  electron.ipcRenderer.send('run-command', 's--;' + printCommand);
}

function createPanelMenu () {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Functions',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'fcns');
    }
  }));
  menu.append(new MenuItem({label: 'Symbols',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'symbols');
    }
  }));
  menu.append(new MenuItem({label: 'Imports',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'imports');
    }
  }));
  menu.append(new MenuItem({label: 'Sections',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'sections');
    }
  }));
  menu.append(new MenuItem({label: 'Registers',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'regs');
    }
  }));
  menu.append(new MenuItem({label: 'Comments',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'comments');
    }
  }));
  menu.append(new MenuItem({label: 'Flags',
    click () {
      electron.ipcRenderer.send('list', listCommand = 'flags');
    }
  }));
  menu.append(new MenuItem({type: 'separator'}));
  return menu;
}

function createMenu () {
  const menu = new Menu();
  const text = window.getSelection().toString();
  if (text !== false) {
    const shortText = text.substring(0, 16) + ((text.length > 16) ? '...' : '');
    menu.append(new MenuItem({label: 'Set flag',
      click () {
        clearScreen = true;
        dialogs().prompt('Set flag at ' + shortText, '', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 'f ' + name + '=' + text + ';' + printCommand);
          }
        });
      }}));
    menu.append(new MenuItem({label: 'Add Comment',
      click () {
        clearScreen = true;
        dialogs().prompt('Comment', '', (name) => {
          if (name) {
            electron.ipcRenderer.send('run-command', 'CC ' + name + '@ ' + shortText + ';' + printCommand);
          }
        });
      }}));
// in hexdump
// if (hasClass(labelHexButton, 'active')) {
    menu.append(new MenuItem({label: 'Show flags',
      click () {
        clearScreen = true;
        electron.ipcRenderer.send('run-command', printCommand = 'pxa|H');
      }}));
// }
    if (text.length > 1) {
      menu.append(new MenuItem({label: 'Add comment',
        click () {
          clearScreen = true;
          dialogs().prompt('Comment at ' + shortText, '', (name) => {
            if (name) {
              electron.ipcRenderer.send('run-command', 'CC ' + name + '=' + text + ';' + printCommand);
            }
          });
        }}));
      menu.append(new MenuItem({label: 'Seek to ' + shortText,
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', 's ' + text + ';' + printCommand);
        }}));
      menu.append(new MenuItem({label: 'Analyze at ' + shortText,
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', 's ' + text + ';af;' + printCommand);
        }}));
      menu.append(new MenuItem({label: 'Find references',
        click () {
          clearScreen = true;
          electron.ipcRenderer.send('run-command', '/r ' + text + ';pd|H');
        }}));
      menu.append(new MenuItem({type: 'separator'}));
    }
  }
  menu.append(new MenuItem({label: 'Undefine',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'af-;f-;'+printCommand);
    }}));
  menu.append(new MenuItem({label: 'Analyze Function',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'af;' + printCommand);
    }}));
  menu.append(new MenuItem({label: 'Rename Function',
    click () {
      clearScreen = true;
          dialogs().prompt('New function name', '', (name) => {
            if (name) {
      electron.ipcRenderer.send('run-command', 'afn ' + name + ';fr ' + name + ';' + printCommand);
            }
   });
    }}));

  menu.append(new MenuItem({type: 'separator'}));

  menu.append(new MenuItem({label: 'Change blocksize',
    click () {
      clearScreen = true;
          dialogs().prompt('Block size', '', (name) => {
            if (name) {
      electron.ipcRenderer.send('run-command', 'b ' + name + ';' + printCommand);
            }
});
    }}));
  menu.append(new MenuItem({label: 'Toggle bytes',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!asm.bytes;pd|H');
    }}));
  menu.append(new MenuItem({label: 'Toggle color',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!scr.color;pd|H');
    }}));
  menu.append(new MenuItem({type: 'separator'}));
// debugger
  menu.append(new MenuItem({label: 'Add breakpoint',
    click () {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 'e!scr.color;pd|H');
    }}));
  return menu;
}

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const menu = createMenu();
  menu.popup(electron.remote.getCurrentWindow());
}, false);

document.addEventListener('DOMContentLoaded', function () {
  const entryInput = document.getElementById('entry-input');
  const searchInput = document.getElementById('search-input');
  const consoleDiv = document.getElementById('console-div');
  const searchConsole = document.getElementById('search-console');
  const labelsTable = document.getElementById('labels');
  const notesText = document.getElementById('notes-text');

  consoleDiv.onmouseup = function () {
    const text = window.getSelection().toString();
    if (text.startsWith('0x')) {
      clearScreen = true;
      electron.ipcRenderer.send('run-command', 's ' + text + ';' + printCommand);
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

  function updateLinks () {
    var anchors = document.getElementsByClassName('clickableLabel');
    for (var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      anchor.onclick = function (ev) {
        ev.target.style.backgroundColor = '#909090';
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

  function toggleTheme () {
    const isBlackTheme = (consoleDiv.style.backgroundColor === 'black');
    clearScreen = true;
    if (isBlackTheme) {
      electron.ipcRenderer.send('run-command', 'eco white;' + printCommand);
      consoleDiv.style.color = 'black';
      consoleDiv.style.backgroundColor = 'white';
      entryInput.style.color = 'black';
      entryInput.style.backgroundColor = 'white';
      labelsTable.style.color = 'black';
      labelsTable.style.backgroundColor = 'white';
      notesText.style.color = 'black';
      notesText.style.backgroundColor = 'white';
    } else {
      electron.ipcRenderer.send('run-command', 'eco tango;' + printCommand);
      consoleDiv.style.color = 'white';
      consoleDiv.style.backgroundColor = 'black';
      entryInput.style.color = 'white';
      entryInput.style.backgroundColor = 'black';
      labelsTable.style.color = 'white';
      labelsTable.style.backgroundColor = 'black';
      notesText.style.color = 'white';
      notesText.style.backgroundColor = 'black';
    }
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
        resetTabs();
        addClass(searchTab, 'active');
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
    if (arg.command.startsWith('e scr.html=true')) {
      arg.command = arg.command.substring(16);
    }
    if (arg.command.indexOf('agf') != -1 || arg.command.indexOf('pdc') != -1) {
      if (arg.result.trim() === '') {
        arg.result = '<br />No function found.<br /><br/>Click <a href="javascript:analyze()">here</a> to analyze.';
      }
    }
    if (hasClass(searchTab, 'active')) {
      searchConsole.innerHTML = '<pre>' + arg.result + '</pre>';
    } else if (clearScreen) {
      consoleDiv.innerHTML = '<a href="javascript:up()">[^]</a><b>&gt; ' + arg.command + '</b>\n' + arg.result;
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

  function onclick(name, cb) {
    const x = document.getElementById(name);
    x.onclick = cb;
  }

  onclick ('pencil-button', () => {
    dialogs().prompt('Write "text" or hexpairs', (name) => {
      if (name) {
        if (name[0] === '"') {
    electron.ipcRenderer.send('run-command', 'w ' + 
   name.substring(1,name.length-1) + ';' + printCommand);
        } else {
    electron.ipcRenderer.send('run-command', 'wx ' + name + ';' + printCommand);
        }
      }
    });
  });

  onclick ('feather-button', () => {
    dialogs().prompt('Write "text" or hexpairs', (name) => {
      if (name) {
        if (name[0] === '"') {
    electron.ipcRenderer.send('run-command', 'w ' + 
   name.substring(1,name.length-1) + ';' + printCommand);
        } else {
    electron.ipcRenderer.send('run-command', 'wx ' + name + ';' + printCommand);
        }
      }
    });
  });

  onclick ('copy-button', () => {
    dialogs().prompt('How many bytes to copy?', (name) => {
      if (name) {
        electron.ipcRenderer.send('run-command', 'y ' + name + ';' + printCommand);
      }
    });
  });
  onclick ('paste-button', () => {
    electron.ipcRenderer.send('run-command', 'yy;'+printCommand);
  });

  const helpButton = document.getElementById('help-button');
  helpButton.onclick = _ => {
    alert('r2app - by pancake@nopcode.org\n\n'
    + 'Cmd + [1-9] - change tab\n'
    + 'Cmd + G     - goto address/symbol\n'
    + 'Cmd + N     - new window\n'
    + 'Cmd + W     - close window\n');
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
  const labelHexButton = document.getElementById('label-hex-button');
  const labelDisButton = document.getElementById('label-dis-button');
  const labelDecButton = document.getElementById('label-dec-button');
  const labelGphButton = document.getElementById('label-gph-button');
  const labelAddButton = document.getElementById('label-add-button');
  const labelDelButton = document.getElementById('label-del-button');
  const consoleTab = document.getElementById('console-tab');
  const scriptingTab = document.getElementById('scripting-tab');
  const scriptingWindow = document.getElementById('scripting-window');
  const dashboardTab = document.getElementById('dashboard-tab');
  const dashboardWindow = document.getElementById('dashboard-window');

  const notesTab = document.getElementById('notes-tab');
  const notesWindow = document.getElementById('notes-window');

  const searchTab = document.getElementById('search-tab');
  const searchWindow = document.getElementById('search-window');
  const consoleWindow = document.getElementById('console-window');

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
    const menu = createPanelMenu();
    menu.popup(electron.remote.getCurrentWindow());
  };

  labelSearchButton.onclick = _ => {
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
  };

  function resetTabs () {
    removeClass(consoleTab, 'active');
    removeClass(dashboardTab, 'active');
    removeClass(scriptingTab, 'active');
    removeClass(notesTab, 'active');
    removeClass(searchTab, 'active');
    if (notesWindow) {
      notesWindow.style.visibility = 'hidden';
    }
    if (searchWindow) {
      searchWindow.style.visibility = 'hidden';
    }
    if (scriptingWindow) {
      scriptingWindow.style.visibility = 'hidden';
    }
    if (dashboardWindow) {
      dashboardWindow.style.visibility = 'hidden';
    }
  }
  scriptingTab.onclick = () => {
    resetTabs();
    addClass(scriptingTab, 'active');
    if (scriptingWindow) {
      scriptingWindow.style.visibility = 'visible';
    }
  };
  consoleTab.onclick = () => {
    resetTabs();
    addClass(consoleTab, 'active');
    if (consoleDiv) {
      consoleDiv.style.visibility = 'visible';
    }
  };
  dashboardTab.onclick = () => {
    // TODO
    resetTabs();
    addClass(dashboardTab, 'active');
    if (dashboardWindow) {
      dashboardWindow.style.visibility = 'visible';
    }
  };
  notesTab.onclick = () => {
    resetTabs();
    addClass(notesTab, 'active');
    if (notesWindow) {
      notesWindow.style.visibility = 'visible';
    }
  };
  searchTab.onclick = () => {
    // WIP
    resetTabs();
    addClass(searchTab, 'active');
    if (searchWindow) {
      searchWindow.style.visibility = 'visible';
    }
  };
  function reset () {
    removeClass(labelDisButton, 'active');
    removeClass(labelHexButton, 'active');
    removeClass(labelDecButton, 'active');
    removeClass(labelGphButton, 'active');
  }
  labelHexButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = hexCommand + '|H');
    reset();
    addClass(labelHexButton, 'active');
  };

  labelDisButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'pd|H');
    reset();
    addClass(labelDisButton, 'active');
  };

  labelDecButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'pdsf;pdc|H');
    reset();
    addClass(labelDecButton, 'active');
  };

  labelGphButton.onclick = _ => {
    clearScreen = true;
    electron.ipcRenderer.send('run-command', printCommand = 'agf|H');
    reset();
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
      electron.ipcRenderer.send('run-command', '/c ' + searchInput.value);
      searchInput.value = '';
    }
  });
});
