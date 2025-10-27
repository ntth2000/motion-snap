# 1. api: upload_video, nhận đầu vào là file mp4 rồi đầu ra là các file frame ảnh; 
# 2. api: draw_poses, nhận đầu vào các các file frame ảnh rồi đầu ra là: 
#     (i) các file frame ảnh có vẽ điểm poses
#     (ii) xâu JSON theo format: { "tên_điểm_pose" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }
#           (chú ý là xâu JSON này có ít nhất là 12 điểm poses khác nhau)
# 3. api: draw_3d, nhận đầu vào các các file frame ảnh rồi đầu ra là: 
#     (i) các file frame ảnh có vẽ đường bao 3D
#     (ii) xâu JSON theo format: { "số_thứ_tự_của_điểm_trên_đường_bao_3D" : [toạ_độ_trục_x, toạ_độ_trục_y, toạ_độ_trục_z] }

import cv2
import mediapipe as mp
import json
import os
import numpy as np

def extract_frames(video_path: str, output_path: str) -> list:
    """
    Extract frames from a video file.

    Args:
        video_path (str): Path to the video file.
    
    Returns:
        list: List of frames extracted from the video.
    """
    print("loading video...")
    vid = cv2.VideoCapture(video_path)
    frames = []
    
    count, success = 0, True
    os.makedirs(output_path, exist_ok=True)
    while success:
        success, image = vid.read() # Read frame
        if success:
            filename = f"{count:06d}.jpg"
            filepath = os.path.join(output_path, filename)
            print(filepath)
            ok = cv2.imwrite(filepath, image)
            if not ok:
                print("❌ Failed to save:", filepath)
            frames.append(filepath)
            count += 1

    vid.release()
    print(f"Extracted {count} frames.")
    return frames

def draw_poses_on_frame(
    frame_path: str,
    output_path: str,
    json_output_path: str,
    person_id: int = 0
):
    """
    Detect human pose using MediaPipe, draw landmarks, and export annotation JSON 
    compatible with EasyMocap format.

    Args:
        frame_path: Path to the image file.
        output_path: Path to save image with drawn keypoints.
        json_output_path: Path to save JSON annotation.
        person_id: ID of detected person (default 0)
    """
    print(f"Processing {frame_path}...")

    image = cv2.imread(frame_path)
    if image is None:
        raise FileNotFoundError(f"Image not found: {frame_path}")

    h, w, _ = image.shape

    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    # Kết quả JSON
    annotation = {
        "filename": frame_path,
        "height": h,
        "width": w,
        "annots": []
    }

    with mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5) as pose:
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if results.pose_landmarks:
            # Vẽ pose lên ảnh
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Trích xuất keypoints
            landmarks = results.pose_landmarks.landmark
            keypoints = []
            xs, ys = [], []

            for lm in landmarks:
                x = lm.x * w
                y = lm.y * h
                c = lm.visibility  # confidence score từ MediaPipe
                keypoints.append([x, y, c])
                xs.append(x)
                ys.append(y)

            # Bounding box (xmin, ymin, xmax, ymax)
            l, t, r, b = float(min(xs)), float(min(ys)), float(max(xs)), float(max(ys))
            area = (r - l) * (b - t)
            conf = float(np.mean([lm.visibility for lm in landmarks]))

            # Thêm thông tin 1 người
            annot = {
                "personID": person_id,
                "bbox": [l, t, r, b, conf],
                "keypoints": keypoints,
                "area": area
            }

            annotation["annots"].append(annot)

    # Lưu ảnh có vẽ keypoints
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, image)

    # Lưu annotation JSON
    os.makedirs(os.path.dirname(json_output_path), exist_ok=True)
    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(annotation, f, ensure_ascii=False, indent=4)

    print(f"Saved annotated image → {output_path}")
    print(f"Saved annotation JSON → {json_output_path}")

    return annotation
