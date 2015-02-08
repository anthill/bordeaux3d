ECHO_SUCCESS=@echo " \033[1;32m✔\033[0m  "

all: startcontainer

startcontainer:
	@mkdir docker/.tmp
	@cp -r config docker/.tmp/
	@cp -r polyfills docker/.tmp/
	@cp Gruntfile.js docker/.tmp/
	@cp index.html docker/.tmp/
	@cp index.js docker/.tmp/
	@cp server.js docker/.tmp/
	@cp package.json docker/.tmp/
	@cd docker && docker build -t ants/bordeaux3d:v1 .
	@rm -rf docker/.tmp
	@docker run -d -e VIRTUAL_HOST=bordeaux3d.ants.builders -e VIRTUAL_PORT=9100 -p 9100:9100 ants/bordeaux3d:v1
	$(ECHO_SUCCESS) "Succesfully launched bordeaux3d container."




