export default function SpinningLoader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="w-16 h-16 border-4 border-fluency-blue-500 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}