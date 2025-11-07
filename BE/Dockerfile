
FROM python:3.10

# Set non-interactive
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Sao chép toàn bộ mã nguồn vào container
COPY ./EasyMocap /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    python3-pip \
    python3-setuptools \
    cython3 \
    git \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Optional: set python3 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1
# Luôn dùng đúng python3
RUN python3 -m pip install --upgrade pip setuptools wheel cython \
    && python3 -m pip install --no-cache-dir -r requirements.txt \
    && python3 -m pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 \
        --index-url https://download.pytorch.org/whl/cpu \
    && python3 -m pip install pandas seaborn \
    && python3 -m pip install --upgrade "protobuf<3.20.0" \
    && python3 -m pip install chumpy==0.70 --no-build-isolation

RUN python3 - <<'EOF'
import torch
from pathlib import Path
torch.hub.set_dir("/root/.cache/torch/hub")
repo = 'ultralytics/yolov5'
model = torch.hub.load(repo, 'yolov5m', pretrained=True, skip_validation=True)
Path("/root/.cache/torch/hub/ultralytics_yolov5_master").chmod(0o755)
print("✅ YOLOv5 weights cached in /root/.cache/torch/hub")
EOF

# ⚡ Tải sẵn model PARE (để không cần tải lại khi chạy)
RUN apt-get update && apt-get install -y unzip && \
    unzip /app/models/pare/pare-github-data.zip -d models/pare && \
    rm /app/models/pare/pare-github-data.zip

# ---------------------------
# OpenPose build (commented out for now)
# ---------------------------
# WORKDIR /opt
# RUN git clone https://github.com/CMU-Perceptual-Computing-Lab/openpose.git --depth 1
# WORKDIR /opt/openpose
# RUN git submodule update --init --recursive --remote
# BUILD OpenPose với CPU_ONLY
# WORKDIR /app/EasyMocap/openpose
# RUN mkdir -p build && cd build && \
#     cmake -DGPU_MODE=CPU_ONLY \
#           -DUSE_CUDA=OFF \
#           -DUSE_CUDNN=OFF \
#           -DUSE_OPENCL=OFF \
#           -DBUILD_PYTHON=ON \
#           -DBUILD_EXAMPLES=OFF \
#           .. && \
#     make -j"$(nproc)"
# ENV PYTHONPATH=/opt/openpose/build/python:$PYTHONPATH
# ---------------------------

# WORKDIR /app

# Install Python requirements
# RUN pip3 install --no-cache-dir -r EasyMocap/requirements.txt
RUN apt-get update && apt-get install -y ffmpeg

RUN apt-get update && apt-get install -y --no-install-recommends \
    libosmesa6-dev libegl-mesa0 libgl1-mesa-dev libglu1-mesa \
    build-essential cmake git \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --force-reinstall PyOpenGL PyOpenGL-accelerate pyrender
RUN python3 -m pip install "numpy==1.23.5" --no-cache-dir --index-url https://pypi.org/simple
# Thêm biến môi trường cho Python
ENV PYOPENGL_PLATFORM=osmesa

WORKDIR /app
