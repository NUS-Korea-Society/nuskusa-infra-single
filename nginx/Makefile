install_requirements:
	@echo "Installing Requirements"
	apt install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring
	@echo "Importing Nginx GPG Keys"
	curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
    | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
	@echo "Verifying downloaded key"
	gpg --dry-run --quiet --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
	@echo "Add Nginx to APT repository"
	echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
	@echo "Installing Nginx"
	apt update
	apt install nginx

