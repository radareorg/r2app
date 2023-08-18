import webview

struct App {
	w &webview.Webview
}

const html = '<!DOCTYPE html>
<html lang="en">
	<head>
	<script>
	function ProgressBar_dots(pc) {
		let bar = "";
		for (let i = 0; i < pc; i++) {
			bar += "<div class=ProgressBar></div>";
		}
		return bar;
	}
	let pc = 0;
	function run_progress() {
		const input = document.getElementById("prompt");
		input.addEventListener("keypress", function(event) {
			if (event.key === "Enter") {
				input.value = "";
			    event.preventDefault();
			}
		});
	const lp = document.getElementById("load_progress");
	setInterval(function () {
		lp.innerHTML = ProgressBar_dots(++pc);
		if (pc == 10) {
			pc = 0;
		}
	}, 2000);
	}
	document.addEventListener("DOMContentLoaded",
	run_progress);
	</script>
	</head>
	<style>
	.Menu:hover {
		background-color: #e0e0e0;
		display:inline-block;
		cursor:pointer;
	}
	.Menu {
		display-block:inline;
		border-color:#fff;
		display:inline-block;
		display-block:inline;
		background-color: #d0d0d0;
		padding:0px;
		margin-right:5px;
		color: black;
		font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif ;
		vertical-align: middle;
		font-size: 12px;
		height: 20px;
		background-color: #d0d0d0;
	}
	body {
		background-color: white;
		color: black;
		text-align: left;
		font-family: Arial, sans-serif;
		padding-top:4px;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
	}
	.menubar {
		box-shadow: 0 0 2px -1px rgb(0,0,0, 0.2);
		border: 2px solid #c0c0c0;
		vertical-align: middle;
		position:absolute;
		overflow-x:hidden;
		top:0px;
		left: 0px;
		right: 0px;
		padding: 2px;
		text-align:left;
		font-family: system-ui, Arial, sans-serif;
		font-size: 16px;
		background-color: #d0d0d0;
		width: 100%;
		height: 20px;
	}
	.Button {
		color:#444;
		user-select:none;
		border:2px solid white;
		margin:10px solid blue !important;
		background:#DDD;
		/* box-shadow: 4 5 5px -3px rgba(0,0,0,0.2); */
		cursor:pointer;
		vertical-align:middle;
		background-color:#e0e0e0;
		max-width: 100px;
		padding: 5px;
		text-align: center;
		select:none;
		height: 50px;
		display: table-cell;
		height:32px;
		width:100px;
	}
	.Button:hover {
		color:black;
		background-color:#eeeeee;
		user-select:none;
		/* box-shadow: 0 0 5px -1px rgba(0,0,0,0.6); */
	}
	.Button:active {
		color:black;
		background-color:#d0d0d0;
		user-select:none;
		/* box-shadow: 0 0 5px -1px rgba(0,0,0,0.6); */
	}
	.ButtonBox {
		text-align:right;
		display:inline-block;
		overflow-x:hidden;
		position:absolute;
		bottom:5px;
		right:5px;">
	}
	.Progress {
    	vertical-align:middle;
		display:inline-block;
		overflow-x:hidden;
		background-color:white;
		padding:4px;
		padding-bottom:0px;
		border: 4px solid #d0d0d0;
		height:24px;
		width:200px;
		text-align:left;
	}
	.ProgressBar {
		display:inline-block;
		background-color:#3030a0;
		width:16px;
		height:16px;
		margin:2px;
	}
	.ListView {
		overflow:scroll;
    	vertical-align:middle;
		display:inline-block;
		overflow-x:hidden;
		background-color:white;
		margin:10px;
		right:10px;
		margin-right:-20px;
		padding:4px;
		padding-bottom:0px;
		border: 2px solid #d0d0d0;
		height:24px;
		width:auto;
		text-align:left;
	}
	.SideRight {
		z-index:-999;
		position:absolute;
		top:0px;
		right:0px;
		left:200px;
		width:auto;
		background-color:white;
		display:inline-block;
		overflow:hidden;
		padding:4px;
		padding-bottom:0px;
		padding-top:16px;
		border: 0px;
		height:100%;
	}
	.SideLeft {
		z-index:-99;
		position:absolute;
		top:0px;
		left:0px;
		width:192px;
		background-color:#f0f0f0;
		display:inline-block;
		overflow-x:hidden;
		padding:4px;
		padding-top:32px;
		border-right: 2px solid #d0d0d0;
		height:100%;
		text-align:left;
	}
	.Frame {
    	vertical-align:middle;
		display:inline-block;
		overflow-x:hidden;
		background-color:white;
		margin:10px;
		right:10px;
		margin-right:-20px;
		padding:4px;
		padding-bottom:0px;
		border: 2px solid #d0d0d0;
		height:24px;
		width:auto;
		text-align:left;
	}
	.Input {
		bottom:0px;
	}
	.InputField {
		border:2px solid #d0d0d0;
		color:#303030;
		padding-left:4px;
		font-family: system-ui, Arial, sans-serif;
		outline: none;
		font-size: 14px;
		position:absolute;
		bottom:40px;
		width:185px;
	}
	</style>
	<body>
		<div class="menubar">
		<div class="Menu" href="File">File</div>
		<div class="Menu" href="Edit">Edit</div>
		<div class="Menu" href="Help">Help</div>
		</div>
		<div class="ButtonBox">
		<div class="Button" onclick="my_v_func()">Cancel</div>
		<div class="Button" onclick="exit()">Ok</div>
		</div>
		<div class="SideLeft">
		This is the left side
		<div class="Input">
		<input class="InputField" id="prompt" type="text" />
		</div>
		</div>
		<div class="SideRight">
			<h1>Loading app</h1>
			<div class="Frame">
			This is a frame with text inside
			</div>
			<br />
			<br />
			<center>
			<div class="Progress" id="load_progress"> </div>
			</center>
		</div>
	</body>
</html>'

fn my_v_func(event_id &char, args &char, app &App) {
	println('Hello From V!')
}

fn my_v_exit(event_id &char, args &char, app &App) {
	// app.w.eval('document.body.style.backgroundColor="#f0f0f0"')
	exit(0)
}

fn main() {
	mut app := App{
		w: webview.create(debug: true)
	}
	app.w.bind('my_v_func', my_v_func, app)
	app.w.bind('exit', my_v_exit, app)
	app.w.set_size(450, 300, .min)
	app.w.set_size(600, 400, .@none)
	app.w.set_html(html)
	app.w.run()
}
