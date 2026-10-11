# Environnement de développement PinVault : Ubuntu 24.04 + JDK 21 + Maven + Node 22 + client Docker
FROM eclipse-temurin:21-jdk-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends git curl ca-certificates postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Maven 3.9 (image officielle)
COPY --from=maven:3.9-eclipse-temurin-21 /usr/share/maven /usr/share/maven
RUN ln -s /usr/share/maven/bin/mvn /usr/bin/mvn
ENV MAVEN_HOME=/usr/share/maven

# Node 22 + npm (image officielle)
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Client Docker + Compose (pour Testcontainers et docker compose depuis le conteneur)
COPY --from=docker:cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:cli /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

WORKDIR /workspaces/disney-pins
