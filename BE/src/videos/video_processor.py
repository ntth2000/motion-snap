# 1. api: upload_video, nhận đầu vào là file mp4 rồi đầu ra là các file frame ảnh;
# 2. api: draw_poses, nhận đầu vào các các file frame ảnh rồi đầu ra là:
#     (i) các file frame ảnh có vẽ điểm poses
#     (ii) xâu JSON theo format: { "tên_điểm_pose" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }
#           (chú ý là xâu JSON này có ít nhất là 12 điểm poses khác nhau)
# 3. api: draw_3d, nhận đầu vào các các file frame ảnh rồi đầu ra là:
#     (i) các file frame ảnh có vẽ đường bao 3D
#     (ii) xâu JSON theo format: { "số_thứ_tự_của_điểm_trên_đường_bao_3D" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }
import logging
import os
import subprocess
from pathlib import Path

import cv2
from moviepy import ImageSequenceClip

from src.database import SessionLocal

from .enums import JobStatus
from .models import Job

logger = logging.getLogger(__name__)


def extract_frames(post_id: int, sub_folder_name: str):
    print(f"Extracting frames for video_path={post_id}/{sub_folder_name}...")
    input_path = f"/workspace/inputs/{post_id}/{sub_folder_name}"

    cmd = [
        "docker",
        "run",
        "--rm",
        "--name",
        f"extract_frames_{post_id}_{sub_folder_name}",
        "-v",
        f"{os.getcwd()}/storage/inputs/{post_id}/{sub_folder_name}:{input_path}",
        "easymocap",
        "bash",
        "-c",
        f"python3 apps/preprocess/extract_image.py ..{input_path} && sync",
    ]

    subprocess.run(cmd, check=True)
    print(f"Frames extracted successfully for video_path={post_id}/{sub_folder_name}")


def extract_2d(post_id: int, view_index: int):
    print("===> Start to extract 2d.")
    input_path = f"/workspace/inputs/{post_id}/{view_index:03d}"
    print("input_path", input_path)

    cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{os.getcwd()}/storage/inputs/{post_id}/{view_index:03d}:{input_path}",
        "easymocap",
        "bash",
        "-c",
        f"python3 -m apps.preprocess.extract_keypoints ../workspace/inputs/{post_id}/{view_index:03d} --mode yolo-hrnet",
    ]

    print("Running command:", " ".join(cmd))

    try:
        result = subprocess.run(
            cmd,
            stdout=None,
            stderr=None,
            text=True,
            check=True,
        )
        return {"status": "success", "output": result.stdout}

    except subprocess.CalledProcessError as e:
        print("Docker command failed:")
        print("Exit code:", e.returncode)
        print("----- STDOUT -----")
        print(e.stdout)
        print("----- STDERR -----")
        print(e.stderr)
        raise Exception(e.stderr)


def draw_2d_vertices(post_id: int, view_index: int):
    """
    Gọi Docker container để chạy 2D vertices extraction.
    Input trên host: storage/inputs/{video_id}
    Mount vào container để chạy run.py.
    """
    print("===> Start to draw 2d vertices.")
    # Đường dẫn input thực tế trên máy host
    input_path = f"/workspace/inputs/{post_id}/{view_index:03d}"
    output_path = f"/workspace/outputs/{post_id}/{view_index:03d}"

    # Đường dẫn trên host
    host_input_path = os.path.join(
        os.getcwd(), "storage", "inputs", str(post_id), str(f"{view_index:03d}")
    )
    host_output_path = os.path.join(
        os.getcwd(), "storage", "outputs", str(post_id), str(f"{view_index:03d}")
    )

    # Đảm bảo thư mục tồn tại
    os.makedirs(host_output_path, exist_ok=True)

    # Command bên trong container
    cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{host_input_path}:{input_path}",
        "-v",
        f"{host_output_path}:{output_path}",
        "easymocap",
        "bash",
        "-c",
        (
            "export PYOPENGL_PLATFORM=egl && "
            "python3 -m apps.mocap.run "
            "--data config/datasets/svimage.yml "
            "--exp config/1v1p/hrnet_pare_finetune.yml "
            f"--root ..{input_path} "
            f"--out ..{output_path} "
            "--skip_vis_final --skip_final && sync"
        ),
    ]

    # Gọi subprocess
    process = subprocess.run(
        cmd,
        stdout=None,
        stderr=None,
        text=True,
        check=True,
    )
    logger.info("after draw 2d vertices")

    # Kiểm tra lỗi
    if process.returncode != 0:
        raise RuntimeError(
            f"Docker command failed:\n{process.stderr or process.stdout}"
        )

    print(process.stdout)
    return (
        f"2D vertices drawn successfully for post_id={post_id} view_index={view_index}"
    )


def draw_3d_vertices(post_id: int, view_index: int):
    """
    Gọi Docker container để chạy 2D vertices extraction.
    Input trên host: storage/inputs/{video_id}
    Mount vào container để chạy run.py.
    """
    # Đường dẫn input thực tế trên máy host
    BASE_DIR = os.path.abspath(os.getcwd())
    host_patch_dir = os.path.join(BASE_DIR, "new_draw_3d")
    host_input_path = os.path.join(
        BASE_DIR, "storage", "inputs", str(post_id), str(f"{view_index:03d}")
    )
    host_output_path = os.path.join(
        BASE_DIR, "storage", "outputs", str(post_id), str(f"{view_index:03d}")
    )

    # Đường dẫn trên host

    container_input = f"/workspace/inputs/{post_id}/{view_index:03d}"
    container_output = f"/workspace/outputs/{post_id}/{view_index:03d}"
    container_patch_mount = "/mnt/patch"
    # Đảm bảo thư mục tồn tại
    os.makedirs(host_output_path, exist_ok=True)

    # Command bên trong container
    copy_cmds = (
        f"mkdir -p /workspace/models && "
        f"cp {container_patch_mount}/smpl_partSegmentation_mapping.pkl models/ && "
        f"cp {container_patch_mount}/vis3d.py myeasymocap/io/vis3d.py && "
        f"cp {container_patch_mount}/hrnet_pare_finetune.yml config/1v1p/hrnet_pare_finetune.yml"
    )

    main_cmd = (
        "export PYOPENGL_PLATFORM=egl && "
        "python3 -m apps.mocap.run "
        "--data config/datasets/svimage.yml "
        "--exp config/1v1p/hrnet_pare_finetune.yml "
        f"--root ..{container_input} "
        f"--out ..{container_output} "
        "--skip_vis_final && sync"
    )

    full_bash_cmd = f"{copy_cmds} && {main_cmd}"

    cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{host_input_path}:{container_input}",
        "-v",
        f"{host_output_path}:{container_output}",
        "-v",
        f"{host_patch_dir}:{container_patch_mount}",
        "easymocap",
        "bash",
        "-c",
        full_bash_cmd,
    ]

    # Gọi subprocess
    process = subprocess.run(
        cmd,
        stdout=None,
        stderr=None,
        text=True,
        check=True,
    )

    # Kiểm tra lỗi
    if process.returncode != 0:
        raise RuntimeError(
            f"Docker command failed:\n{process.stderr or process.stdout}"
        )

    return (
        f"2D vertices drawn successfully for post_id={post_id} view_index={view_index}"
    )


def render_frames_to_video(frames_dir, output_path, fps=30):
    """
    Render frames in a directory to a video file using ffmpeg.
    Args:
        frame_path (str): Path to the directory containing frame images.
    Returns:
        str: Path to the output video file.
    """
    logger.info("before render frames to video")
    frames_dir = Path(frames_dir)
    images = sorted(
        [
            str(frames_dir / f)
            for f in os.listdir(frames_dir)
            if f.endswith((".jpg", ".png"))
        ]
    )

    if not images:
        raise ValueError("Không có ảnh nào trong thư mục frames!")

    # Tạo video clip từ danh sách ảnh
    clip = ImageSequenceClip(images, fps=fps)

    # Xuất ra video (codec libx264 = mp4)
    clip.write_videofile(str(output_path), codec="libx264", audio=False)
    logger.info("after render frames to video")


def get_video_fps(video_path: str) -> float:
    """
    Lấy fps của video sử dụng ffprobe
    Args:
        video_path (str): Đường dẫn đến file video
    Returns:
        float: fps của video
    """
    print(video_path)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Không mở được video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return fps
