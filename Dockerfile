<!
RUN dnf update -y && \
    dnf install -y \
    wget \
    tar \
    gcc \
    g++ \
    gfortran \
    python3.11 \
    python3.11-pip && \
    dnf clean all

# Set Scilab version and download URL
ARG SCILAB_VERSION=2025.1.0
ARG SCILAB_URL=[https://www.scilab.org/download/scilab-$](https://www.scilab.org/download/scilab-$){SCILAB_VERSION}/scilab-${SCILAB_VERSION}-linux-x86_64.tar.xz

# Download and extract Scilab
WORKDIR /opt
RUN wget -qO- ${SCILAB_URL} | tar -xJ && \
    ln -s /opt/scilab-${SCILAB_VERSION} /opt/scilab

# Set up the Python service wrapper environment
WORKDIR /app
COPY requirements.txt.
RUN python3.11 -m pip install --no-cache-dir -r requirements.txt
COPY worker.py.

# Stage 2: Final Image - Create a lean production image
FROM rockylinux/rockylinux:10

# Install only necessary runtime dependencies
RUN dnf update -y && \
    dnf install -y python3.11 && \
    dnf clean all

# Copy Scilab installation and Python app from the builder stage
COPY --from=builder /opt/scilab* /opt/
COPY --from=builder /app /app

# Set environment variables for Scilab
ENV SCILAB_HOME=/opt/scilab
ENV PATH=$SCILAB_HOME/bin:$PATH

# Set the working directory
WORKDIR /app

# Command to run the worker service
# This script will connect to the message queue to receive and process jobs.
CMD ["python3.11", "worker.py"]
```
]]>
