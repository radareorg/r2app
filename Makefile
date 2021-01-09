all: dist
	node_modules/.bin/electron --unhandled-rejections=strict .

file:
	node_modules/.bin/electron . /bin/ls

node_modules:
	npm i

dist: node_modules
	cp -rf node_modules/photonkit/dist dist

osx mac macos rls release:
	$(shell npm bin)/electron-packager . \
		--overwrite --platform=darwin --arch=x64 \
		--icon=img/icon64.png --prune=true --out=release-builds

_linux:
	$(shell npm bin)/electron-packager . \
		--overwrite --platform=linux --arch=x64 \
		--icon=img/icon64.png --prune=true --out=release-builds

w32 win32:
	$(shell npm bin)/electron-packager . \
		--overwrite --platform=win32 --arch=ia32 \
		--icon=img/icon64.png --prune=true --out=release-builds

w64 win64:
	$(shell npm bin)/electron-packager . \
		--overwrite --platform=win32 --arch=x64 \
		--icon=img/icon64.png --prune=true --out=release-builds

linux lin:
	$(shell npm bin)/electron-packager . \
		--overwrite --platform=linux --arch=x64 \
		--icon=img/icon64.png --prune=true --out=release-builds
	rm -f release-builds/RadareApp-linux-x64.zip
	cd release-builds && zip -r RadareApp-linux-x64.zip RadareApp-linux-x64

indent:
	npm run indent
