from datetime import datetime

from src.videos.models import Job, JobStatus


def rollback_jobs(db):
    processing_jobs = db.query(Job).filter(Job.status == JobStatus.PROCESSING).all()

    for job in processing_jobs:
        job.status = JobStatus.FAILED
        job.error_message = "Server restarted while job was processing"
        job.finished_at = datetime.utcnow()

    db.commit()

    return len(processing_jobs)
