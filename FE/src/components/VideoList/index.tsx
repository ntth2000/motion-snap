import { ExclamationCircleFilled, PlusSquareOutlined, AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, message, Modal, Space, Tag, Typography, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { deleteVideo, getAllVideos } from "../../services/videoService";
import type { IVideo } from "../../types";
import { eventEmitter } from "../../utils/eventEmitter";
import { formatDate } from "../../utils/util";
import { CustomTable } from "../Table";
import VideoCard from "./VideoCard";


const videosPerRowOptions = [5, 6, 7].map(num => ({ value: num, label: `${num} per row` }));

const VideoList: React.FC = () => {
	const [page, setPage] = useState(1);
	const [viewType, setViewType] = useState<"grid" | "list">("grid");
	const [videos, setVideos] = useState<IVideo[]>([]);
	const [modal, modalContextHolder] = Modal.useModal();
	const [messageApi, msgContextHolder] = message.useMessage();
	const navigate = useNavigate();

	const pageSize = 10;
	const pagedData = videos.slice((page - 1) * pageSize, page * pageSize);
	const [videosPerRow, setVideosPerRow] = useState<number>(5);
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
		<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Button
					type={viewType === 'grid' ? 'primary' : 'default'}
					onClick={() => setViewType('grid')}
					icon={<AppstoreOutlined />}
				/>
				<Button
					style={{ marginLeft: 8 }}
					type={viewType === 'list' ? 'primary' : 'default'}
					onClick={() => setViewType('list')}
					icon={<UnorderedListOutlined />}
				/>
				{viewType === 'grid' && (
					<Select
						style={{ width: 160, marginLeft: 12 }}
						value={videosPerRow}
						onChange={(v) => setVideosPerRow(Number(v))}
						options={videosPerRowOptions}
					/>
				)}
			</div>
		</div>

		{viewType === 'list' ? (
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
									<Typography.Link
										style={{
											fontWeight: "600",
											fontSize: "16px",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											cursor: "pointer",
										}}
										onClick={() => { navigate(`/video/${record.id}`); }}
									>
										{record.video}
									</Typography.Link>
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
				data={pagedData}
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
		) : (
			<div>
				{pagedData.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '40px 0' }}>
						<Button onClick={onUploadVideo}>
							<PlusSquareOutlined />
							<span style={{ marginLeft: 8 }}>Upload your first video</span>
						</Button>
					</div>
				) : (
					<div style={{ display: 'grid', gap: 16, gridTemplateColumns: `repeat(${videosPerRow}, minmax(0, 1fr))` }}>
						{pagedData.map((record) => <VideoCard key={record.id} record={record} navigate={navigate} showDeleteConfirm={showDeleteConfirm} />)}
					</div>
				)}
			</div>
		)}
	</>
}
export default VideoList;