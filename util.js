function hasClass (el, className) {
  if (el.classList) { return el.classList.contains(className); } else { return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)')); }
}

function addClass (el, className) {
  if (el.classList) { el.classList.add(className); } else if (!hasClass(el, className)) el.className += ' ' + className;
}

function removeClass (el, className) {
  if (el.classList) { el.classList.remove(className); } else if (hasClass(el, className)) {
    const reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
}

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}
