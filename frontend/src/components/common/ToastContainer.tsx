import { useToastStore } from '../../store/toastStore';

const colorMap = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 border rounded-lg shadow-md ${colorMap[t.type]} animate-in`}
        >
          <span className="font-bold text-lg leading-none mt-0.5">{iconMap[t.type]}</span>
          <p className="flex-1 text-sm">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
