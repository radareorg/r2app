if (typeof require === 'undefined') {
  alert('Cannot require electron in webview');
}
const electron = require('electron');
const $ = document.getElementById.bind(document);

document.addEventListener('DOMContentLoaded', function () {
  const homeButton = document.getElementById('home-button');
  homeButton.onclick = () => {
    document.location.href = 'index.html';
  };
});

try {
electron.ipcRenderer.send('packages');
  electron.ipcRenderer.on('packages', (event, res) => {
    let msg = '';
    // msg += '<hr><td>one</td><td>two</td><td style="width:100%">tri</td></hr>';
    for (let pkg of res) {
      let trAttr = '';
      if (pkg.installed) {
        trAttr = 'style="background-color:#c0e0c0"';
      }
      msg += '<tr '+trAttr+'><td><b>' + pkg.name + '</b></td><td>' + pkg.type + '</td><td>' + pkg.desc + '</td></tr>\n';
    }
    $('pkgs-table').innerHTML = msg;
  });
} catch (e) {
  alert(''+e);
}
