import { Button, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CommentAuthOverlay from "./CommentAuthOverlay";

const { TextArea } = Input;

interface CommentInputProps {
  placeholder?: string;
  submitting?: boolean;
  postId: string;
  isAuthenticated?: boolean;
  handleSubmitComment: (content: string) => Promise<void>;
}

export const CommentInput = ({
  placeholder = "Write a comment...",
  submitting = false,
  isAuthenticated = false,
  handleSubmitComment
}: CommentInputProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await handleSubmitComment(value.trim());
    setValue("");
  };

  return (
    <div className="relative flex flex-col w-full bg-white border border-gray-200 rounded-xl py-3 pb-2 shadow-sm">
      <div className={`px-3 pb-3 transition-all duration-300 ${!isAuthenticated ? "blur-[2px] pointer-events-none" : ""}`}>
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          bordered={false}
          autoSize={{ minRows: 4, maxRows: 8 }}
          className="w-full bg-transparent resize-none p-0 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:shadow-none"
        />
      </div>

      <div className={`flex items-center justify-end px-4 pt-2 border-t border-gray-100 transition-all duration-300 ${!isAuthenticated ? "blur-[2px]" : ""}`}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!value.trim() || !isAuthenticated}
          className="flex items-center justify-center rounded-lg font-medium h-9 px-6"
        >
          {t("comment.submitComment")}
        </Button>
      </div>

      {!isAuthenticated && (
        <div className="absolute inset-0 z-10">
          <CommentAuthOverlay />
        </div>
      )}
    </div>
  );
};