// CommentItem.tsx
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { CommentNode } from "./buildCommentTree";
import { formatDate } from "../../utils/util";
import { useNavigate } from "react-router";

interface Props {
  comment: CommentNode;
  setIsReplying?: (isReplying: boolean) => void;
  isAuthenticated?: boolean;
}

const { Text, Paragraph } = Typography;
const menuItems = [
  {
    key: "edit",
    label: "Edit",
  },
  {
    key: "delete",
    label: "Delete",
    danger: true,
  },
];
export const CommentItem = ({ comment, setIsReplying, isAuthenticated = false }: Props) => {
  const navigate = useNavigate();

  const actions: { name: string, type: string, isDisplay: boolean }[] = [
    { name: "Reply", type: "reply", isDisplay: comment.depth === 0 },
    { name: "Edit", type: "edit", isDisplay: true },
    { name: "Delete", type: "delete", isDisplay: true },
  ];

  const deleteComment = () => {
    console.log(`Delete comment ID: ${comment.id}`);
  };

  const editComment = () => {
    console.log(`Edit comment ID: ${comment.id}`);
  };

  const replyToComment = () => {
    console.log(`Reply to comment ID: ${comment.id}`);
    setIsReplying && setIsReplying(true);
  }

  const handleActionClick = (actionType: string) => {
    console.log(`Action clicked: ${actionType} on comment ID: ${comment.id}`);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    switch (actionType) {
      case "delete":
        deleteComment();
        break;
      case "edit":
        editComment();
        break;
      case "reply":
        replyToComment();
        break;
      default:
        break;
    };
  };

  return (
    <div className="comment-item">
      <Space align="start" style={{ width: "100%" }}>
        <Avatar>{comment.username[0]}</Avatar>

        <div style={{ flex: 1, width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space size={8}>
              <Text strong>{comment.username}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(comment.createdAt)}
              </Text>
            </Space>
          </div>

          {/* Content */}
          <Paragraph className="content">
            {comment.isDeleted ? (
              <Text type="secondary" italic>
                Comment đã bị xoá
              </Text>
            ) : (
              comment.content
            )}
          </Paragraph>
          <div className="actions">
            {actions.filter(a => a.isDisplay).map(a => (
              <Button
                color="default"
                variant="link"
                key={a.type}
                className="action"
                style={{ padding: 0, marginRight: 8, height: 'fit-content' }}
                onClick={() => handleActionClick(a.type)}
              >
                {a.name}
              </Button>
            ))}
          </div>
        </div>
      </Space>
    </div>
  );
};

