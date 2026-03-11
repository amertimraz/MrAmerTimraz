export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-14 w-14' }[size];
  return (
    <div className="flex items-center justify-center p-6">
      <div className={`${s} animate-spin rounded-full border-4 border-primary-200 border-t-primary-600`} />
    </div>
  );
}
