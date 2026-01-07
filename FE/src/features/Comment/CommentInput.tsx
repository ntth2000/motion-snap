import { Button, Input } from "antd";
import { useState } from "react";
import { postComment } from "../../services/commentService";
import CommentAuthOverlay from "./CommentAuthOverlay";

const { TextArea } = Input;

interface CommentInputProps {
  placeholder?: string;
  submitting?: boolean;
  videoId: string;
  isAuthenticated?: boolean;
}

export const CommentInput = ({
  videoId,
  placeholder = "Write a comment...",
  submitting = false,
  isAuthenticated = false,
}: CommentInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await postComment(videoId, value.trim());
    setValue("");
  };

  return (
    <div
      style={{
        width: "100%",
        border: "1px solid #e9ecef",
        borderRadius: 12,
        padding: '12px 0 8px 0',
        background: "#fff",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >

      <div style={{ padding: "0 0 12px 0", filter: isAuthenticated ? "none" : "blur(2px)" }}>
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          bordered={false}
          style={{
            outline: "none",
            background: "transparent",
            width: "calc(100% - 24px)",
            margin: "0 12px",
            height: "120px",
            overflowY: "auto",
            resize: "none",
            fontSize: 14
          }}
        />
      </div>


      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px 4px 16px",
          borderTop: "1px solid #f0f0f0",
          filter: isAuthenticated ? "none" : "blur(2px)",
        }}
      >
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!value.trim()}
          style={{ fontSize: 14 }}
        >
          Post comment
        </Button>
      </div>

      {!isAuthenticated && (
        <CommentAuthOverlay />
      )}
    </div>
  );
};