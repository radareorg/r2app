const r2 = {};
function desync (x) {
  x.then(_ => {}).catch(console.error);
}

if (typeof document === 'undefined') {
  // nodejs
  const { ipcMain } = require('electron');
} else {
  const { ipcRenderer } = require('electron');
  // webkit
  r2.cmd = async function (cmd) {
    return ipcRenderer.invoke('r2cmd', cmd);
  };
  r2.plugins = async function (type) {
    return ipcRenderer.invoke('plugins', type);
  };
  r2.projects = async function () {
    return ipcRenderer.invoke('projects');
  };
}
r2.filter_asm = function(x, display) {
	var curoff = backward ? prev_curoff : next_curoff;
	;
	var lastoff = backward ? prev_lastoff : next_lastoff;
	;
	var lines = x.split(/\n/g);
	r2.cmd('s', function(x) {
		curoff = x;
	});
	for (var i = lines.length - 1; i > 0; i--) {
		var a = lines[i].match(/0x([a-fA-F0-9]+)/);
		if (a && a.length > 0) {
			lastoff = a[0].replace(/:/g, '');
			break;
		}
	}
	if (display == 'afl') {
		//hasmore (false);
		var z = '';
		for (var i = 0; i < lines.length; i++) {
			var row = lines[i].replace(/\ +/g, ' ').split(/ /g);
			z += row[0] + '  ' + row[3] + '\n';
		}
		x = z;
	} else if (display[0] == 'f') {
		//hasmore (false);
		if (display[1] == 's') {
			var z = '';
			for (var i = 0; i < lines.length; i++) {
				var row = lines[i].replace(/\ +/g, ' ').split(/ /g);
				var mark = row[1] == '*' ? '*' : ' ';
				var space = row[2] ? row[2] : row[1];
				if (!space) continue;
				z += row[0] + ' ' + mark + ' <a href="javascript:runcmd(\'fs ' +
				space + '\')">' + space + '</a>\n';
			}
			x = z;
		} else {
		}
	} else if (display[0] == 'i') {
		//hasmore (false);
		if (display[1]) {
			var z = '';
			for (var i = 0; i < lines.length; i++) {
				var elems = lines[i].split(/ /g);
				var name = '';
				var addr = '';
				for (var j = 0; j < elems.length; j++) {
					var kv = elems[j].split(/=/);
					if (kv[0] == 'addr') {
						addr = kv[1];
					}
					if (kv[0] == 'name') {
						name = kv[1];
					}
					if (kv[0] == 'string') {
						name = kv[1];
					}
				}
				z += addr + '  ' + name + '\n';
			}
			x = z;
		}
	} //else hasmore (true);

	function haveDisasm(x) {
		if (x[0] == 'p' && x[1] == 'd') return true;
		if (x.indexOf(';pd') != -1) return true;
		return false;
	}
	if (haveDisasm(display)) {
	//	x = x.replace(/function:/g, '<span style=color:green>function:</span>');
/*
		x = x.replace(/;(\s+)/g, ';');
		x = x.replace(/;(.*)/g, '// <span style=\'color:#209020\'>$1</span>');
		x = x.replace(/(bl|goto|call)/g, '<b style=\'color:green\'>call</b>');
		x = x.replace(/(jmp|bne|beq|js|jnz|jae|jge|jbe|jg|je|jl|jz|jb|ja|jne)/g, '<b style=\'color:green\'>$1</b>');
		x = x.replace(/(dword|qword|word|byte|movzx|movsxd|cmovz|mov\ |lea\ )/g, '<b style=\'color:#1070d0\'>$1</b>');
		x = x.replace(/(hlt|leave|iretd|retn|ret)/g, '<b style=\'color:red\'>$1</b>');
		x = x.replace(/(add|sbb|sub|mul|div|shl|shr|and|not|xor|inc|dec|sar|sal)/g, '<b style=\'color:#d06010\'>$1</b>');
		x = x.replace(/(push|pop)/g, '<b style=\'color:#40a010\'>$1</b>');
		x = x.replace(/(test|cmp)/g, '<b style=\'color:#c04080\'>$1</b>');
		x = x.replace(/(outsd|out|string|invalid|int |int3|trap|main|in)/g, '<b style=\'color:red\'>$1</b>');
		x = x.replace(/nop/g, '<b style=\'color:blue\'>nop</b>');
*/
		x = x.replace(/(reloc|class|method|var|sym|fcn|str|imp|loc)\.([^:<(\\\/ \|)\->]+)/g, '<a href=\'javascript:r2ui.seek("$1.$2")\'>$1.$2</a>');
	}
	x = x.replace(/0x([a-zA-Z0-9]+)/g, '<a href=\'javascript:r2ui.seek("0x$1")\'>0x$1</a>');
	// registers
	if (backward) {
		prev_curoff = curoff;
		prev_lastoff = lastoff;
	} else {
		next_curoff = curoff;
		next_lastoff = lastoff;
		if (!prev_curoff) {
			prev_curoff = next_curoff;
		}
	}
	return x;
};
