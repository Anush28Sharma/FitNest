/**
 * Common reusable Input component - Flat Design Style
 * Using background colors to define edges, not lines or shadows.
 */
export default function Input({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  const baseStyles = 'w-full bg-muted text-foreground px-4 py-3 rounded-md transition-all duration-200 outline-none font-medium';
  const normalStyles = 'focus:bg-white border-2 border-transparent focus:border-accent';
  const errorStyles = 'bg-red-50 text-red-900 border-2 border-red-500';

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-accent transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-bold text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}
