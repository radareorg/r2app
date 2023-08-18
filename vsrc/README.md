# VWebViewR2PoC

This is a PoC of an electron-like app written in V.

The thing generates a 300KB portable executable that uses system webview

Uses https://github.com/ttytm/webview

## Install v-webview

On linux

```
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev
```

and then just run the following lines:

```
rm -rf ~/.vmodules/webview
git clone --recurse-submodules https://github.com/ttytm/webview.git ~/.vmodules/webview
~/.vmodules/webview/src/build.vsh
```

## Install r2pipe

```
v install radare.r2pipe
```

## Run the app

```
v run app2.v
```
