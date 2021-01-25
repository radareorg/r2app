all clean mrproper install uninstall dist macos linux win64:
	$(MAKE) -C src $@

indent:
	scripts/html-indent.js src/*.html src/ui/*/*.html
	scripts/css-indent.sh src/*.css src/ui/*/*.css
	$(MAKE) -C src indent

.PHONY: all clean mrproper install uninstall dist macos linux win64 indent
