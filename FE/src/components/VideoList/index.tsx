import { ExclamationCircleFilled, PlusOutlined } from "@ant-design/icons";
import { Space, Tag, Typography, Button, Modal, Image, Row, Col } from "antd";
import { useState } from "react";
import { CustomTable } from "../Table";
import type { IVideo } from "../../types";

const { Text } = Typography;
const { confirm } = Modal;

const mockData: IVideo[] = [
	{
		key: '1',
		video: 'Workout Tutorial.mp4',
		createdAt: '2025-10-25 14:32',
		status: 'completed',
		title: 'Morning Workout Routine',
		description: 'A quick morning workout to start your day.'
	},
	{
		key: '2',
		video: 'Cooking Show Episode 3.mp4',
		createdAt: '2025-10-26 09:10',
		status: 'drawing',
		title: 'Delicious Pasta Recipe',
		description: 'Learn how to make delicious pasta from scratch.'
	},
	// {
	// 	key: '3',
	// 	video: 'Travel Vlog - Japan.mov',
	// 	createdAt: '2025-10-27 18:45',
	// 	status: 'extracting',
	// 	title: 'Exploring Tokyo',
	// 	description: 'Join me as I explore the vibrant city of Tokyo.'
	// },
	// {
	// 	key: '4',
	// 	video: 'Interview with CEO.mp4',
	// 	createdAt: '2025-10-28 11:00',
	// 	status: 'completed',
	// 	title: 'Insights from the CEO',
	// 	description: 'An in-depth interview with the CEO about company vision.'
	// },
	// {
	// 	key: '5',
	// 	video: 'Dance Performance.mp4',
	// 	createdAt: '2025-10-29 20:15',
	// 	status: 'drawing',
	// 	title: 'Contemporary Dance',
	// 	description: 'A mesmerizing contemporary dance performance.'
	// },
];

const VideoList: React.FC = ({ }) => {
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const paginated = mockData.slice((page - 1) * pageSize, page * pageSize);
	const onUploadClick = () => {
		console.log("Upload button clicked");
	};
	const showDeleteConfirm = () => {
		confirm({
			title: 'Are you sure delete this task?',
			icon: <ExclamationCircleFilled />,
			content: 'Some descriptions',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				console.log('OK');
			},
			onCancel() {
				console.log('Cancel');
			},
		});
	};

	return <CustomTable
		columns={[
			{
				key: "video",
				title: "Video",
				render: (record) => (
					<div>
						<Row gutter={24}>
							<Col>
								<Image preview={false} src="src/dummyData/image.png" alt="video icon" style={{ borderRadius: '8px' }} width={150} />
							</Col>
							<Col>
								<a style={{ fontWeight: 500 }}>{record.video}</a>
								<div style={{ fontSize: '14px', fontWeight: 600 }}>{record.title}</div>
								<Text type="secondary">{record.description}</Text>
							</Col>
						</Row>
					</div>
				),
			},
			{ key: "createdAt", title: "Created At", width: '15%' },
			{
				key: "status",
				title: "Status",
				width: '12%',
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
				width: '20%',
				render: () => (<>
					<Space size="middle">
						<Button onClick={() => { }}>Edit</Button>
						<Button danger onClick={showDeleteConfirm}>Delete</Button>
					</Space>

				</>)
			},
		]}
		data={paginated}
		total={mockData.length}
		pageSize={pageSize}
		current={page}
		onPageChange={(p) => setPage(p)}
		noData={
			<div style={{ textAlign: "center", padding: "40px 0" }}>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={onUploadClick}
					size="large"
				>
					Upload your first video
				</Button>
			</div>
		}
	/>
}
export default VideoList;