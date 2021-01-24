all clean mrproper install uninstall dist macos linux win64 indent:
	$(MAKE) -C src $@

indent:
	scripts/html-indent.js src/*.html src/p/*/*.html
