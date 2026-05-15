/**
 * Common reusable Button component - Flat Design Style
 * Relying on scale, color, and typography instead of depth.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 rounded-md';

  const variants = {
    primary: 'bg-accent text-white hover:bg-blue-600',
    secondary: 'bg-muted text-foreground hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-4 border-accent text-accent bg-transparent hover:bg-accent hover:text-white',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 h-12 text-sm',
    lg: 'px-8 h-14 text-base',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin rounded-full h-5 w-5 border-4 border-current border-t-transparent mr-2"></span>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
