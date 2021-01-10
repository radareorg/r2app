r2app User Guide
================

Installation
------------

The easiest way to install it is by downloading the official builds from GitHub for your platform.

Alternatively it is easy to run it from git by typing the following commands:

```
$ git clone https://github.com/radareorg/r2app
$ cd r2app
$ make
```
To update just run `git pull` and `make`.

Issues
------

This software is work in progress and it is expected to find issues or miss some features. Please,
use the [github issues](https://github.com/radareorg/r2app/issues) page or the *r2 chats* to report
or discuss them.

But if you feel brave enough to want to fix them set the following environment and submit pullreqs!

```
$ export R2APP_DEBUG=1
```

This will open the Electron debug console, for more details on how the code is structured and how
to extend to app read the [developer guide](dev.md)

Basic Usage
------------

In the main window, we can see some elements:

![](../img/r2app.png)

* Input field for file path or r2 uri://
* A button to open the binary and another to open in debug mode
* Toggle boxes to specify loading options
  * rw: open the file in read-write
  * bin: loads the bin info in file headers
  * str: find strings
  * aa: run analysis
* List of projects below
* Info button
