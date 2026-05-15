/**
 * Common reusable Badge component - Flat Design Style
 */
export default function Badge({ 
  children, 
  variant = 'primary', 
  className = '',
  dot = false,
  pulse = false
}) {
  const variants = {
    primary: 'bg-accent text-white',
    secondary: 'bg-accent-secondary text-white',
    accent: 'bg-amber-500 text-white',
    muted: 'bg-muted text-foreground',
    outline: 'border-2 border-accent text-accent',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${variantClass} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </div>
  );
}
