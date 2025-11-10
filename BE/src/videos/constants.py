import os

VIDEO_PATH=os.path.join("storage", "inputs")
RESULT_PATH=os.path.join("storage", "outputs")

MAX_DURATION_IN_SECONDS=30
ALLOWED_VIDEO_EXTENSIONS={'mp4'}

COCO_12_POINTS = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip"
]
