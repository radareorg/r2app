all clean mrproper install uninstall dist macos linux win64:
	$(MAKE) -C src $@

indent:
	scripts/html-indent.js src/*.html src/p/*/*.html
	scripts/css-indent.sh src/*.css src/p/*/*.css
	$(MAKE) -C src indent

.PHONY: all clean mrproper install uninstall dist macos linux win64 indent
