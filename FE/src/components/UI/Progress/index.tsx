import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { Progress, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function UploadProgress({ uploadProgress, title, description, isDisplayBackBtn = false }: { uploadProgress?: number, title?: string, description?: string, isDisplayBackBtn?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isIndeterminate = uploadProgress === undefined || uploadProgress === null;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 w-full max-w-[400px]">

        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-bold text-slate-800 m-0">{title}</h3>
          <p className="text-slate-500 text-sm m-0">{description}</p>
        </div>


        {isIndeterminate ? (
          <div className="w-full px-2 flex justify-center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48, color: '#8fc9ff' }} spin />}
            />
          </div>
        ) : <>
          <div className="w-full px-2">
            <Progress
              percent={uploadProgress}
              strokeColor={{
                '0%': '#c5dbffff',
                '100%': '#8fc9ff',
              }}
              strokeWidth={16}
              status="active"
              strokeLinecap="round"
              format={(percent) => (
                <span className="text-slate-700 font-bold ml-2">{percent}%</span>
              )}
            />
          </div>
          {uploadProgress < 100 ? (
            <div className="text-slate-400 text-xs animate-pulse">
              {t("uploadModal.progress.processing")}
            </div>
          ) : (
            <div className="text-primary text-sm font-medium flex items-center gap-2">
              <CheckCircleFilled /> {t("uploadModal.progress.finish")}
            </div>
          )}
        </>}
        {isDisplayBackBtn &&
          <button
            onClick={() => { navigate("/") }}
            className="cursor-pointer text-slate-500 hover:text-primary">
            Go to home
          </button>
        }
      </div>
    </div>
  )
}