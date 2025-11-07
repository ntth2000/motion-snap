# 1. api: upload_video, nhận đầu vào là file mp4 rồi đầu ra là các file frame ảnh; 
# 2. api: draw_poses, nhận đầu vào các các file frame ảnh rồi đầu ra là: 
#     (i) các file frame ảnh có vẽ điểm poses
#     (ii) xâu JSON theo format: { "tên_điểm_pose" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }
#           (chú ý là xâu JSON này có ít nhất là 12 điểm poses khác nhau)
# 3. api: draw_3d, nhận đầu vào các các file frame ảnh rồi đầu ra là: 
#     (i) các file frame ảnh có vẽ đường bao 3D
#     (ii) xâu JSON theo format: { "số_thứ_tự_của_điểm_trên_đường_bao_3D" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }
import subprocess
import json
import os
import numpy as np
from src.videos.constants import RESULT_PATH


def extract_frames(video_id: int):
    print(f"Extracting frames for video_id={video_id}...")
    input_path = f"/workspace/inputs/{video_id}"

    cmd = [
        "docker", "run",
        "--name", f"extract_frames_{video_id}",
        "-v", f"{os.getcwd()}/storage/inputs/{video_id}:{input_path}",
        "easymocap",
        "bash", "-c",
        f"python3 apps/preprocess/extract_image.py ..{input_path} && sync"
    ]



    subprocess.run(cmd, check=True)
    print(f"Frames extracted successfully for video_id={video_id}")


def extract_2d(video_id: int):
    input_path = f"/workspace/inputs/{video_id}"
    host_path = f"{os.getcwd()}/storage/inputs/{video_id}"

    cmd = [
        "docker", "run", "--rm",
        "-v", f"{os.getcwd()}/storage/inputs/{video_id}:{input_path}",
        "easymocap",
        "bash", "-c",
        f"python3 -m apps.preprocess.extract_keypoints ../workspace/inputs/{video_id} --mode yolo-hrnet"
    ]

    print("👉 Running command:", " ".join(cmd))

    try:
        result = subprocess.run(
            cmd,
            check=True
        )
        print("✅ STDOUT:", result.stdout)
        print("✅ STDERR:", result.stderr)
        return {"status": "success", "output": result.stdout}

    except subprocess.CalledProcessError as e:
        print("❌ Docker command failed:")
        print("Exit code:", e.returncode)
        print("----- STDOUT -----")
        print(e.stdout)
        print("----- STDERR -----")
        print(e.stderr)
        raise


def draw_2d_vertices(video_id: int):
    """
    Gọi Docker container để chạy 2D vertices extraction.
    Input trên host: storage/inputs/{video_id}
    Mount vào container để chạy run.py.
    """
    # Đường dẫn input thực tế trên máy host
    input_path = f"/workspace/inputs/{video_id}"
    output_path = f"/workspace/outputs/{video_id}"

    # Đường dẫn trên host
    host_input_path = os.path.join(os.getcwd(), "storage", "inputs", str(video_id))
    host_output_path = os.path.join(os.getcwd(), "storage", "outputs", str(video_id))

    # Đảm bảo thư mục tồn tại
    os.makedirs(host_output_path, exist_ok=True)

    # Command bên trong container
    cmd = [
        "docker", "run", "--name", f"draw_2d_vertices_{video_id}", "--rm",
        "-v",  f"{host_input_path}:{input_path}",
        "-v",  f"{host_output_path}:{output_path}",
        "easymocap", "bash", "-c",
        (
            "export PYOPENGL_PLATFORM=egl && "
            "python3 -m apps.mocap.run "
            "--data config/datasets/vimage.yml "
            "--exp config/1v1p/hrnet_pare_finetune.yml "
            f"--root ..{input_path} "
            f"--out ..{output_path} "
            "--skip_vis_final && sync"
        )
    ]


    print("Running command:", " ".join(cmd))

    # Gọi subprocess
    process = subprocess.run(cmd, check=True)

    # Kiểm tra lỗi
    if process.returncode != 0:
        raise RuntimeError(
            f"Docker command failed:\n{process.stderr or process.stdout}"
        )

    print(process.stdout)
    return f"2D vertices drawn successfully for video_id={video_id}"


def draw_3d_vertices(video_id: int):
    """
    Gọi Docker container để chạy 2D vertices extraction.
    Input trên host: storage/inputs/{video_id}
    Mount vào container để chạy run.py.
    """
    # Đường dẫn input thực tế trên máy host
    input_path = f"/workspace/inputs/{video_id}"
    output_path = f"/workspace/outputs/{video_id}"

    # Đường dẫn trên host
    host_input_path = os.path.join(os.getcwd(), "storage", "inputs", str(video_id))
    host_output_path = os.path.join(os.getcwd(), "storage", "outputs", str(video_id))

    # Đảm bảo thư mục tồn tại
    os.makedirs(host_output_path, exist_ok=True)

    # Command bên trong container
    cmd = [
        "docker", "run", "--name", f"draw_3d_vertices_{video_id}", "--rm",
        "-v",  f"{host_input_path}:{input_path}",
        "-v",  f"{host_output_path}:{output_path}",
        "easymocap", "bash", "-c",
        (
            "export PYOPENGL_PLATFORM=egl && "
            "python3 -m apps.mocap.run "
            "--data config/datasets/svimage.yml "
            "--exp config/1v1p/hrnet_pare_finetune.yml "
            f"--root ..{input_path} "
            f"--out ..{output_path} "
            "&& sync"
        )
    ]


    print("Running command:", " ".join(cmd))

    # Gọi subprocess
    process = subprocess.run(cmd, check=True)

    # Kiểm tra lỗi
    if process.returncode != 0:
        raise RuntimeError(
            f"Docker command failed:\n{process.stderr or process.stdout}"
        )

    print(process.stdout)
    return f"2D vertices drawn successfully for video_id={video_id}"
