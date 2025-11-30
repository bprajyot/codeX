import { AlertTriangle, XCircle, Shield } from 'lucide-react'

export const AIDetectionModal = ({ show, onClose, detectionData }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-red-950 via-slate-900 to-black border-2 border-red-500 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl shadow-red-500/50 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-red-500/10 border-b border-red-500/30 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20" />
          <div className="relative flex items-center gap-6">
            <div className="p-5 bg-red-500/20 rounded-2xl border-2 border-red-500/50">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-red-400 mb-2">
                AI PLAGIARISM DETECTED
              </h2>
              <p className="text-red-300/80 text-lg">
                Your submission has been flagged by our detection system
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Score Display */}
          <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300 text-lg">AI Suspicion Score</span>
              <span className="text-5xl font-black text-red-400">
                {detectionData?.suspicion_score || 0}<span className="text-2xl text-red-300">/100</span>
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000 animate-pulse"
                style={{ width: `${detectionData?.suspicion_score || 0}%` }}
              />
            </div>
            
            <div className="mt-3 text-sm text-red-300/70 text-center">
              Threshold: {detectionData?.breakdown?.threshold || 65} (Detection triggered)
            </div>
          </div>

          {/* Detection Breakdown */}
          {detectionData?.breakdown && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-400" />
                Detection Analysis
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(detectionData.breakdown).map(([key, value]) => {
                  if (key === 'total_score' || key === 'threshold' || key === 'verdict') return null
                  
                  return (
                    <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-400">
                          {value.score || 0}
                        </span>
                        <span className="text-xs text-slate-500">
                          {value.weight || ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Verdict */}
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400 animate-pulse" />
              <h3 className="text-2xl font-black text-white">MATCH RESULT</h3>
            </div>
            <p className="text-xl text-red-300 mb-2">
              You have been declared the <span className="font-black">LOSER</span>
            </p>
            <p className="text-slate-400 text-sm">
              Your opponent wins automatically due to AI plagiarism detection
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-yellow-200 space-y-2">
                <p className="font-bold">Fair Play Policy:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
                  <li>AI-generated code is strictly prohibited</li>
                  <li>Write your own solutions to improve your skills</li>
                  <li>Repeated violations may result in account suspension</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}