FROM python:3.12-slim AS builder

WORKDIR /app

# Create a virtual environment
RUN python3 -m venv env

# Install gunicorn and build tools (if needed)
RUN /app/env/bin/pip install --no-cache-dir gunicorn

# Copy your repo contents into the container
COPY . /app

# Install your package
RUN /app/env/bin/pip install .

# Rename server script so gunicorn can import it
RUN mv scripts/boxesserver scripts/boxesserver.py

# -------------------------------

FROM python:3.12-slim

# Install pstoedit (needed for DXF -> SVG conversions)
RUN apt update && \
  apt install -y pstoedit --no-install-recommends && \
  apt clean

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 8000

# Start server
CMD ["/app/env/bin/gunicorn", "-b", "[::]:8000", "-w", "4", "scripts.boxesserver"]
