r2app = {};

r2app.tabs = [];

r2app.buttonBarRemove = function (name) {
  let a = $(name + '-button');
  if (a) a.parentNode.removeChild(a);
}

r2app.tabAdd = function (name) {
  $('tab-group').innerHTML += `
    <div class="tab-item" id="` + name + `-tab">
      <span class="icon icon-cancel icon-close-tab"></span>
      ` + name + `
    </div>
  `;
  $(name + '-tab').onclick = () => {
    resetTabs();
    addClass($(name + '-tab'), 'active');
    const dw = $(name + '-window');
    if (dw) dw.style.visibility = 'visible';
  };
  r2app.tabs.push(name + '-tab');
}

r2app.buttonBarAdd = function (name, icon) {
  $('btn-group').innerHTML += `
    <button id="` + name + `-button" class="btn btn-default">
      <span class="icon icon-` + icon + `"></span>
    </button>
  `;
}

