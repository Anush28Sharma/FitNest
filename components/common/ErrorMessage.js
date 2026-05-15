/**
 * Error Message Component - Flat Design Style
 */
export default function ErrorMessage({ message, className = '' }) {
  if (!message) return null;

  return (
    <div className={`bg-red-500 text-white px-6 py-4 rounded-md text-sm font-bold uppercase tracking-wide animate-fadeIn ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">!</span>
        {message}
      </div>
    </div>
  );
}
