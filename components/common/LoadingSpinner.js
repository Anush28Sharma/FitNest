/**
 * Common reusable Loading Spinner - Flat Design Style
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-8',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`inline-block animate-spin rounded-full border-muted border-t-accent ${sizeClass} ${className}`} />
  );
}
