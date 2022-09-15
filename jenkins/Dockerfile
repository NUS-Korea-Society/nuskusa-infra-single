FROM ubuntu:22.04
COPY init.sh init.sh
RUN chmod 777 init.sh

#Update APT, install essential tools
USER root
RUN apt-get update
RUN apt-get install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common sudo

#Install Java
RUN apt install -y openjdk-11-jre

#Install Jenkins Repository
RUN curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
RUN echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
RUN apt-get update
RUN apt-get install -y jenkins

#Add Docker Repository
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
RUN apt-get update

#Install Jenkins and Docker
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce-cli docker-compose-plugin git-all

RUN /usr/sbin/groupadd -g 2022 -f docker
RUN /usr/sbin/usermod -aG docker jenkins
RUN /usr/sbin/usermod -aG sudo jenkins
RUN echo jenkins  ALL = NOPASSWD: ALL >> /etc/sudoers

ENTRYPOINT ./init.sh
