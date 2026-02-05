import type { AvatarProps as AntdAvatarProps } from "antd";
import { Avatar } from "antd";

import { getFirstChar } from "../../../utils/util";

type AvatarUIProps = {
  name?: string;
  size?: AntdAvatarProps['size'];
  className?: string;
  avatarUrl?: string;
  onClick?: () => void;
}

export default function AvatarUI({
  name = '',
  size,
  className = '',
  avatarUrl,
  onClick
}: AvatarUIProps) {
  const baseClasses = "!bg-primary/10 !text-primary !font-bold border border-primary/20";

  const combinedClassName = `${baseClasses} ${className}`.trim();

  return (
    <Avatar
      size={size}
      className={combinedClassName}
      onClick={onClick}
    >
      {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : getFirstChar(name)}
    </Avatar>
  );
}