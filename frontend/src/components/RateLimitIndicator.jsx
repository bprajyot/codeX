// frontend/src/components/RateLimitIndicator.jsx
import { Clock } from 'lucide-react'

export const RateLimitIndicator = ({ runCooldown, submitCooldown }) => {
  if (runCooldown <= 0 && submitCooldown <= 0) return null

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-3 text-yellow-400">
        <Clock className="w-5 h-5" />
        <div className="flex-1">
          {runCooldown > 0 && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Run Code Cooldown:</span>
              <span className="text-sm font-bold">{runCooldown.toFixed(1)}s</span>
            </div>
          )}
          {submitCooldown > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Submit Cooldown:</span>
              <span className="text-sm font-bold">{submitCooldown.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 h-1 bg-yellow-900/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-500 transition-all duration-100"
          style={{ 
            width: `${Math.max(
              (runCooldown / 3) * 100, 
              (submitCooldown / 3) * 100
            )}%` 
          }}
        />
      </div>
    </div>
  )
}