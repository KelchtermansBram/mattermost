# Stage 1: Build webapp from source so custom favicons (and all client assets) are included.
# The pre-built tarball's favicons are in both images/favicon/ and hashed in files/; only a full build fixes both.
FROM node:24-bookworm-slim AS webapp-build
WORKDIR /webapp
COPY webapp/package.json webapp/package-lock.json ./
COPY webapp/channels/package.json channels/
COPY webapp/platform/client/package.json platform/client/
COPY webapp/platform/components/package.json platform/components/
COPY webapp/platform/shared/package.json platform/shared/
COPY webapp/platform/types/package.json platform/types/
COPY webapp/platform/mattermost-redux/package.json platform/mattermost-redux/
COPY webapp/platform/eslint-plugin/package.json platform/eslint-plugin/
RUN mkdir -p platform/client platform/components platform/shared platform/types platform/mattermost-redux platform/eslint-plugin
# Install deps (postinstall builds workspace packages required for the main build)
RUN npm ci 2>/dev/null || npm install
COPY webapp .
RUN npm run build

# Stage 2: Ubuntu with document processing dependencies and curl for downloading
FROM ubuntu:noble-20251013@sha256:c35e29c9450151419d9448b0fd75374fec4fff364a27f176fb458d472dfc9e54 AS builder
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG PUID=2000
ARG PGID=2000
ARG MM_PACKAGE="https://latest.mattermost.com/mattermost-enterprise-linux"

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  ca-certificates \
  curl \
  media-types \
  mailcap \
  unrtf \
  wv \
  poppler-utils \
  tidy \
  tzdata \
  && rm -rf /var/lib/apt/lists/*

# Download Mattermost server tarball and extract (tarball root may be "mattermost" or "mattermost-*-linux-amd64")
RUN mkdir -p /tmp/mm \
  && curl -L $MM_PACKAGE | tar -xzf - -C /tmp/mm \
  && MM_ROOT="/tmp/mm/$(ls /tmp/mm | head -1)" \
  && mv "$MM_ROOT" /mattermost

# Create mattermost user and client/plugins
RUN groupadd --gid ${PGID} mattermost \
  && useradd --uid ${PUID} --gid ${PGID} --comment "" --home-dir /mattermost mattermost \
  && mkdir -p /mattermost/data /mattermost/plugins /mattermost/client/plugins

# Replace client with our built webapp (includes your custom favicons)
RUN rm -rf /mattermost/client/*
COPY --from=webapp-build /webapp/channels/dist/. /mattermost/client/
RUN chown -R mattermost:mattermost /mattermost

# Create PostgreSQL client SSL directory structure for ssl_mode=require
RUN mkdir -p /mattermost/.postgresql \
  && chmod 700 /mattermost/.postgresql

# Final stage using distroless for minimal attack surface
FROM gcr.io/distroless/base-debian12

# Some ENV variables
ENV PATH="/mattermost/bin:${PATH}"
ENV MM_SERVICESETTINGS_ENABLELOCALMODE="true"
ENV MM_INSTALL_TYPE="docker"

# Copy over metadata files needed by runtime
COPY --from=builder /etc/mime.types /etc

# Copy CA certificates for SSL/TLS validation with proper ownership
COPY --from=builder --chown=2000:2000 /etc/ssl/certs /etc/ssl/certs

# Copy document processing utilities and necessary support files
COPY --from=builder /usr/bin/pdftotext /usr/bin/pdftotext
COPY --from=builder /usr/bin/wvText /usr/bin/wvText
COPY --from=builder /usr/bin/wvWare /usr/bin/wvWare
COPY --from=builder /usr/bin/unrtf /usr/bin/unrtf
COPY --from=builder /usr/bin/tidy /usr/bin/tidy
COPY --from=builder /usr/share/wv /usr/share/wv

# Copy necessary libraries for document processing utilities
COPY --from=builder /usr/lib/libpoppler.so* /usr/lib/
COPY --from=builder /usr/lib/libfreetype.so* /usr/lib/
COPY --from=builder /usr/lib/libpng.so* /usr/lib/
COPY --from=builder /usr/lib/libwv.so* /usr/lib/
COPY --from=builder /usr/lib/libtidy.so* /usr/lib/
COPY --from=builder /usr/lib/libfontconfig.so* /usr/lib/

# Copy mattermost from builder stage
COPY --from=builder --chown=2000:2000 /mattermost /mattermost

# Copy passwd including mattermost user (path relative to repo root context)
COPY server/build/passwd /etc/passwd

# We should refrain from running as privileged user
USER mattermost

# Healthcheck to make sure container is ready - using mmctl instead of curl for distroless compatibility
HEALTHCHECK --interval=30s --timeout=10s \
  CMD ["/mattermost/bin/mmctl", "system", "status", "--local"]

# Configure entrypoint and command with proper permissions
WORKDIR /mattermost
CMD ["/mattermost/bin/mattermost"]

EXPOSE 8065 8067 8074 8075

# Declare volumes for mount point directories
VOLUME ["/mattermost/data", "/mattermost/logs", "/mattermost/config", "/mattermost/plugins", "/mattermost/client/plugins"]
