import MotionPhotosOnIcon from "../../../assets/icons/MotionPhotosOn";

export default function Logo() {
  return <div className="bg-primary relative flex size-9 items-center justify-center rounded-lg transition-transform">
    <span className="material-symbols-outlined text-white">
      <MotionPhotosOnIcon />
    </span>
    <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
  </div>
}