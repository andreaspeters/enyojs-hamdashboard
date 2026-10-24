.PHONY: palm-package palm-install palm-delete palm-run palm-launch deploy

PALM_DEVICE ?= topaz-linux
PALM_APP_ID ?= biz.aventer.hamdashboard
PALM_PACKAGE ?= biz.aventer.hamdashboard_0.2.0_all.ipk
PALM_REMOTE_PACKAGE ?= /tmp/$(PALM_PACKAGE)

deploy:
	rm -rf deploy
	mkdir deploy
	cp -pr enyo deploy/
	cp appinfo.json deploy/
	cp icon.png deploy/
	cp -pr assets deploy/
	cp index.html deploy/
	cp -pr source deploy/
	cp -pr lib deploy/

palm-package: deploy
	java -jar /opt/PalmSDK/0.1/share/jars/webos-tools.jar palm-package --exclude tools deploy

palm-install: palm-delete palm-package
	novacom -d "$(PALM_DEVICE)" put file://$(PALM_REMOTE_PACKAGE) < "$(PALM_PACKAGE)"
	novacom -d "$(PALM_DEVICE)" run "file:///usr/bin/ipkg install $(PALM_REMOTE_PACKAGE)"

palm-delete:
	novacom -d "$(PALM_DEVICE)" run "file:///usr/bin/ipkg remove $(PALM_APP_ID)"

palm-run: palm-install palm-launch

palm-launch:
	novacom -d "$(PALM_DEVICE)" run "file:///usr/bin/luna-send -n 1 palm://com.palm.applicationManager/launch '{\"id\":\"$(PALM_APP_ID)\"}'"

