all clean mrproper install uninstall dist macos linux win64:
	$(MAKE) -C src $@

indent:
	$(MAKE) -C src indent

.PHONY: all clean mrproper install uninstall dist macos linux win64 indent
