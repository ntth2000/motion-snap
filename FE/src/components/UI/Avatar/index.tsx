import { Avatar } from "antd";

import { getFirstChar } from "../../../utils/util";

type AvatarProps = {
  name?: string,
  height?: string,
  width?: string,
  onClick?: () => void
}

export default function AvatarUI({ name = '', height = 'h-10', width = 'w-10', onClick }: AvatarProps) {
  return <Avatar
    className={`${height}! ${width}! text-2xl! !bg-primary/10 !text-primary !font-bold border border-primary/20`}
    onClick={onClick}
  >
    {getFirstChar(name)}
  </Avatar>
}