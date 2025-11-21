FROM python:3.12-slim AS builder

WORKDIR /app

# Create a virtual environment
RUN python3 -m venv env

# Install gunicorn and build tools (if needed)
RUN /app/env/bin/pip install --no-cache-dir gunicorn

# Install dependencies first (better build cache)
COPY requirements.txt /app/requirements.txt
RUN /app/env/bin/pip install --no-cache-dir -r requirements.txt

# Copy your repo contents into the container
COPY . /app

# Install your package
RUN /app/env/bin/pip install .

# Rename server script so gunicorn can import it
RUN mv scripts/boxesserver scripts/boxesserver.py

# -------------------------------

FROM python:3.12-slim

ARG VERSION
ARG COMMIT
ARG CREATED

LABEL \
    org.opencontainers.image.title="Boxes-Py" \
    org.opencontainers.image.description="Python-based Boxes generator server. Unraid-ready and Kiwi-approved." \
    org.opencontainers.image.url="https://github.com/littleroblet/boxes-py" \
    org.opencontainers.image.source="https://github.com/littleroblet/boxes-py" \
    org.opencontainers.image.documentation="https://github.com/littleroblet/boxes-py" \
    org.opencontainers.image.authors="um <nobody@nowhere.nz>" \
    org.opencontainers.image.version="$VERSION" \
    org.opencontainers.image.revision="$COMMIT" \
    org.opencontainers.image.created="$CREATED"

# Install pstoedit (needed for DXF -> SVG conversions)
RUN apt update && \
  apt install -y pstoedit --no-install-recommends && \
  apt clean

WORKDIR /app
COPY --from=builder /app /app

# Set static URL for self-hosted deployment
ENV STATIC_URL=static

EXPOSE 8000

# Start server
CMD ["/app/env/bin/gunicorn", "-b", "[::]:8000", "-w", "4", "scripts.boxesserver"]
