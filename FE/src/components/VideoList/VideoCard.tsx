import { Button, Tag, Typography } from "antd";

interface VideoCardProps {
  record: any;
  navigate: any;
  showDeleteConfirm: (id: number) => void;
}

const VideoCard = ({ record, navigate, showDeleteConfirm }: VideoCardProps) => {
  return <div key={record.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
    <img src={record.thumbnailUrl} alt="thumbnail" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
    <div style={{ padding: 12 }}>
      <Typography.Link
        style={{ display: 'block', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
        onClick={() => { navigate(`/video/${record.id}`); }}
      >
        {record.video}
      </Typography.Link>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.createdAt}</div>
          <div style={{ marginTop: 6 }}>
            {record.status && (() => {
              let text = record.status;
              let color = 'green';
              if (record.status === 'drawing') {
                color = 'orange';
                text = 'Drawing 3D';
              } else if (record.status === 'extracting') {
                color = 'red';
                text = 'Extracting frames';
              }
              return <Tag color={color} style={{ textTransform: 'capitalize' }}>{text}</Tag>;
            })()}
          </div>
        </div>
        <div>
          <Button danger size="small" onClick={() => showDeleteConfirm(record.id)}>Delete</Button>
        </div>
      </div>
    </div>
  </div>;
}

export default VideoCard;