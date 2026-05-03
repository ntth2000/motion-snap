from datetime import datetime

from src.videos.models import Job, JobStatus
import logging

logger = logging.getLogger(__name__)

def rollback_jobs(db):
    logger.info("Rolling back processing jobs")
    processing_jobs = db.query(Job).filter(Job.status == JobStatus.PROCESSING).all()

    for job in processing_jobs:
        job.status = JobStatus.FAILED
        job.error_message = "Server restarted while job was processing"
        job.finished_at = datetime.utcnow()

    db.commit()
    logger.info(f"Rolled back {len(processing_jobs)} processing jobs.")

    return len(processing_jobs)
