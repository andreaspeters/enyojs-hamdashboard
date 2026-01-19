with import <nixpkgs> {};

stdenv.mkDerivation {
name = "node-env";

buildInputs = [
	python311
	nodejs_24
	nodePackages.grunt-cli
	webos.novacomd
	webos.novacom
	webos.cmake-modules
	ares-cli
];

SOURCE_DATE_EPOCH = 315532800;
PROJDIR = "/tmp/node-dev";
S_NETWORK="host";
S_USB_DEVICE="webos";
S_IMAGE="localhost:5000/ubuntu_build:jammy";

shellHook = ''
	nohup python3 -m http.server 8000 --directory . &
	sudo apt update
	sudo apt install -y openjdk-8-jre
	sudo apt install -y ./tools/palm-sdk_3.0.5-svn528736-pho676_i386.deb
	sudo ln -fs /usr/lib/jvm/java-8-openjdk-amd64/bin/java /usr/bin/java
	sudo novacomd -d
	'';
}
