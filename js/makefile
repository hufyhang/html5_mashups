TARGET = script.js
SOURCE = main_events.js market.js big_canvas_events.js jsonFetcher.js md5.js servicesComposer.js widget.js workers.js

script.js: $(SOURCE)
	cat $(SOURCE) > $(TARGET)

.PHONY: clean
clean:
	rm -f $(TARGET)
