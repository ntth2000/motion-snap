import { ExclamationCircleFilled, PlusSquareOutlined } from "@ant-design/icons";
import { Space, Tag, Button, Modal, message, Typography } from "antd";
import { useEffect, useState } from "react";
import { CustomTable } from "../Table";
import type { IVideo } from "../../types";
import { deleteVideo, getAllVideos } from "../../services/videoService";
import { eventEmitter } from "../../utils/eventEmitter";
import { formatDate } from "../../utils/util";

const VideoList: React.FC = ({ }) => {
	const [page, setPage] = useState(1);
	const [videos, setVideos] = useState<IVideo[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modal, modalContextHolder] = Modal.useModal();
	const [messageApi, msgContextHolder] = message.useMessage();
	const [modalStep, setModalStep] = useState<"detail" | "extract_poses" | "draw_3d">("detail");
	const [modalTitle, setModalTitle] = useState("Details")
	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const handleStepChange = (step: "detail" | "extract_poses" | "draw_3d") => {
		setModalStep(step);
		if (step === "detail") {
			setModalTitle("Details")
		} else if (step === "extract_poses") {
			setModalTitle("Extract poses")
		} else if (step === "draw_3d") {
			setModalTitle("Draw 3D")
		}
	};

	const pageSize = 10;
	const onUploadVideo = () => {
		eventEmitter.emit("open-upload-video-modal");
	};
	const showDeleteConfirm = (key: number) => {
		modal.confirm({
			title: 'Are you sure delete this video?',
			icon: <ExclamationCircleFilled />,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: async () => {
				try {
					await deleteVideo(key);
					setVideos(videos.filter(video => video.id !== key));
					messageApi.destroy('delete-video-success');
					messageApi.open({
						type: 'success',
						content: 'Delete video successfully',
						key: 'delete-video-success',
					});
				} catch (err) {
					messageApi.destroy('delete-video-error');
					messageApi.open({
						content: 'Delete video failed',
						type: 'error',
						key: 'delete-video-error',
					});
				}
			}
		});
	};


	const fetchData = async () => {
		try {
			const res = await getAllVideos();
			setVideos(res.videos.map((video: { id: any; filename: any; status: any; thumbnail_url: string; uploaded_at: string; }) => ({
				key: video.id,
				id: video.id,
				video: video.filename,
				status: video.status,
				thumbnailUrl: video.thumbnail_url,
				createdAt: formatDate(video.uploaded_at),
			})))
		} catch (e) {

		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		eventEmitter.on("reload-video-list", fetchData)

		return () => {
			eventEmitter.off("reload-video-list", fetchData)
		}
	}, [])

	return <>
		{modalContextHolder}
		{msgContextHolder}
		<Modal
			destroyOnHidden
			centered
			title={modalTitle}
			closable={{ 'aria-label': 'Custom Close Button' }}
			open={isModalOpen}
			onCancel={handleCancel}
			footer={
				(
					<>
						<Button onClick={handleCancel}>Cancel</Button>
						<Button
							type="primary"
						>
							Next
						</Button>
					</>
				)
			}
			width="70%"
			styles={{
				body: {
					height: "70vh",
					maxHeight: 820,
					overflowY: "auto",
				}
			}}
		>

		</Modal>
		<CustomTable
			columns={[
				{
					key: "video",
					title: "Video",
					render: (record) => (
						<div style={{
							display: "flex",
							gap: "16px",
						}}>
							<img
								src={record.thumbnailUrl}
								alt="thumbnail"
								style={{
									width: "200px",
									height: "120px",
									objectFit: "cover",
									flexShrink: 0,
									borderRadius: "8px"
								}}
							/>
							<div style={{
								flex: 1,
								overflow: "hidden",
							}}>
								<Typography.Text style={{
									fontWeight: "600",
									fontSize: "16px",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis"
								}}>
									{record.video}
								</Typography.Text>
							</div>
						</div>

					),
				},
				{ key: "createdAt", title: "Created At", width: '20%' },
				{
					key: "status",
					title: "Status",
					width: '20%',
					render: (record) => {
						let text = record.status;
						let color = 'green';
						if (record.status === 'drawing') {
							color = 'orange';
							text = "Drawing 3D"
						} else if (record.status === 'extracting') {
							color = 'red';
							text = "Extracting frames"
						}
						return (
							<Tag color={color} key={record.status} style={{ textTransform: 'capitalize' }}>
								{text}
							</Tag>
						);
					}
				},
				{
					key: "action",
					title: "Action",
					width: '10%',
					render: (record) => (<>
						<Space size="middle">
							<Button danger onClick={() => showDeleteConfirm(record.id)}>Delete</Button>
						</Space>

					</>)
				},
			]}
			data={videos.slice((page - 1) * pageSize, page * pageSize)}
			total={videos.length}
			current={page}
			onPageChange={(p) => setPage(p)}
			noData={
				< div style={{ textAlign: "center", padding: "40px 0" }}>
					<Button
						color="default"
						variant="outlined"
						style={{
							padding: '16px',
							marginRight: '16px',
						}}
						onClick={onUploadVideo}
					>
						<PlusSquareOutlined />
						<span
							style={{
								fontWeight: '500',
								fontSize: '16px',
								marginLeft: '2px',
								marginBottom: '1px',
							}}
						>
							Upload your first video
						</span>
					</Button>
				</div >
			}
		/>
	</>
}
export default VideoList;