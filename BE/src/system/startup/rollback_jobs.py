from src.videos.models import Job, JobStatus, ProcessingStage


def rollback_jobs(db):
    incomplete_jobs = (
        db.query(Job).filter(Job.current_stage == ProcessingStage.DRAWING_3D).all()
    )
    for job in incomplete_jobs:
        job.status = JobStatus.EXTRACTED_POSES
    incomplete_jobs = (
        db.query(Job).filter(Job.status == JobStatus.EXTRACTING_POSES).all()
    )
    for job in incomplete_jobs:
        job.status = JobStatus.UPLOADED
    db.commit()
