r2app Developer Guide
=====================

Installation
------------

Always use r2app from git:

```
$ git clone https://github.com/radareorg/r2app
$ cd r2app
$ make
```

To update just run `git pull` and `make`.

Working with Git
----------------

Specify workflow to create a branch commit the changes and create a PR

Advanced workflow recommendations to squash commits, use tig, etc.

Issues
------

This software is work in progress and it is expected to find issues or miss some features. Please,
use the [github issues](https://github.com/radareorg/r2app/issues) page or the *r2 chats* to report
or discuss them.

But if you feel brave enough to want to fix them set the following environment and submit pullreqs!

```
$ export R2APP_DEBUG=1
```

This will open the Electron debug console.

Source
------

r2app is written in Electron, this means that it runs Javascript in Node and Webkit environments
communicated via `ipcMain`.

For example, in `main.js` (which runs in nodejs).

```js
const {ipcMain} = require('electron');
ipcMain.handle('hello', async (event, name) = {
  return 'Hello ' + name + '!';
});
```

Then in `ui/index.js` (runs in webkit environment)

```js
const {ipcRenderer} = require('electron');
ipcRenderer.invoke('hello', 'world')
  .then((res) = {
    alert(res);
  }).catch((err) = {
    alert(err);
  });
```

Sessions
--------

r2app holds a list of sessions of r2pipe instances. Those are listed in the main screen by polling.

Running r2 commands
-------------------

You can run r2 commands from node or webkit environments by using the following code:

If you want to run an r2 command from webkit:

```js

```
