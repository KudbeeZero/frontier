import { useEnemyStore } from '../../stores/useEnemyStore'

export function TargetingReticle() {
  const { lockedTarget } = useEnemyStore()

  if (!lockedTarget) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/70" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/70" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/70" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/70" />
          <div className="absolute inset-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-primary/50 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-danger animate-pulse" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-danger animate-pulse" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-danger animate-pulse" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-danger animate-pulse" />
        <div className="absolute inset-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-danger rounded-full" />
      </div>
    </div>
  )
}
