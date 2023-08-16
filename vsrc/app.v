import webview
import radare.r2pipe

struct App {
	w &webview.Webview
mut:
	r2 r2pipe.R2Pipe
}

const html = '<!DOCTYPE html>
<html lang="en">
	<head>
		<style>
			body {
				background-color: SlateGray;
				color: GhostWhite;
				text-align: center;
			}
		</style>
	</head>
	<body>
		<h1>My App Content!</h1>
		<button onclick="my_v_func()">Call V!</button>
		<button onclick="r2cmd()">Call R2!</button>
		<div id=msg></div>
	</body>
</html>'

fn my_v_func(event_id &char, args &char, app &App) {
	println('Hello From V!')
}

fn r2cmd(event_id &char, args &char, app &App) {
	version := app.r2.cmd('?Vq').trim_space()
	println(version)
	oneline := 'document.getElementById("msg").innerHTML = "' + version+'";'
	app.w.eval(oneline)
	println(oneline)
}

mut app := App{
	w: webview.create(debug: true)
	r2: r2pipe.r2spawn('/bin/ls', '')!
}
app.w.bind('my_v_func', my_v_func, app)
app.w.bind('r2cmd', r2cmd, app)
app.w.set_size(600, 400, .@none)
app.w.set_html(html)
app.w.run()
