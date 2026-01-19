.PHONY: palm-package deploy

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

palm-package:
	java -jar /opt/PalmSDK/0.1/share/jars/webos-tools.jar palm-package --exclude tools deploy

palm-install:
	java -jar /opt/PalmSDK/0.1/share/jars/webos-tools.jar palm-install biz.aventer.hamclock_0.1.0_all.ipk

palm-run: deploy
	java -jar /opt/PalmSDK/0.1/share/jars/webos-tools.jar palm-run --exclude tools deploy

palm-launch: deploy
	java -jar /opt/PalmSDK/0.1/share/jars/webos-tools.jar palm-launch -p "{mojoConfig: {debuggingEnabled:true,timingEnabled:true}}" deploy

