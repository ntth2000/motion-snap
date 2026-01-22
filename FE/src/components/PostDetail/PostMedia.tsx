import { SegmentedControl } from "../UI/SegmentedControl"

interface PostMediaProps {
  videoUrl: string,
  viewOptions: any,
  viewMode: 'originalVideo' | 'extractedPoses' | 'draw3d',
  setViewMode: (val: 'originalVideo' | 'extractedPoses' | 'draw3d') => void
}


export default function PostMedia({ videoUrl, viewOptions, viewMode, setViewMode }: PostMediaProps) {

  return <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="group relative flex aspect-video items-center justify-center bg-black mb-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
          />
        ) : (
          <p className="h-full w-full text-center">This is not available yet</p>
        )}
      </div>
    </div >
    {
      viewOptions.length > 1 && <div className="border-b border-slate-50 pb-4">
        <div className="rounded-xl bg-slate-50 p-1">
          <SegmentedControl
            options={viewOptions}
            value={viewMode}
            onChange={(val) => setViewMode(val as 'originalVideo' | 'extractedPoses' | 'draw3d')}
          />
        </div>
      </div>
    }
  </div>
}