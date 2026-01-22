import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <p className="text-secondary mb-6 max-w-xs mx-auto">
        {message || t('common.error')}
      </p>

      {onRetry && (
        <Button
          type="primary"
          onClick={onRetry}
        >
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}