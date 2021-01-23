r2app = {};

r2app.tabs = [];

r2app.buttonBarRemove = function (name) {
  const a = $(name + '-button');
  if (a) a.parentNode.removeChild(a);
};
r2app.resetTabs = function () {
  for (const tab of r2app.tabs) {
    removeClass($(tab + '-tab'), 'active');
    const tw = $(tab + '-window');
    if (tw) tw.style.visibility = 'hidden';
  }
};

r2app.tabAdd = function (name, html) {
  r2app.tabs.push(name);
  $('tab-group').innerHTML += `
    <div class="tab-item" id="` + name + `-tab">
      <span class="icon icon-cancel icon-close-tab"></span>
      ` + name + `
    </div>
  `;
  $('window-group').innerHTML += `
<div class="window-content" style="overflow:hidden;top:54px;width:100%;height:100%;background-color:white;visibility:hidden;position:absolute;z-index:10000" id="` + name + `-window">
` + html + `
</div>
  `;
  $(name + '-tab').onclick = () => {
    r2app.resetTabs();
    addClass($(name + '-tab'), 'active');
    const dw = $(name + '-window');
    if (dw) dw.style.visibility = 'visible';
  };
};

r2app.buttonBarAdd = function (name, icon) {
  $('btn-group').innerHTML += `
    <button id="` + name + `-button" class="btn btn-default">
      <span class="icon icon-` + icon + `"></span>
    </button>
  `;
};
