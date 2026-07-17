export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-2xl text-lavender/90">{message}</p>
    </div>
  )
}
