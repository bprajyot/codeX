import { Check, Clock, Trophy } from 'lucide-react'

export const MatchStatus = ({ match, currentUserId, player1, player2 }) => {
  if (!match) return null

  const isPlayer1 = match.player1_id === currentUserId
  const currentPlayer = isPlayer1 ? player1 : player2
  const opponent = isPlayer1 ? player2 : player1
  const currentResult = isPlayer1 ? match.player1_result : match.player2_result
  const opponentResult = isPlayer1 ? match.player2_result : match.player1_result

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-white font-semibold">{currentPlayer?.username}</div>
            {/* <div className="text-emerald-500 text-sm">{currentPlayer?.elo} ELO</div> */}
            {currentResult?.passed_all && (
              <Check className="w-5 h-5 text-emerald-500 mx-auto mt-1" />
            )}
          </div>
          
          <div className="text-slate-500 text-2xl">VS</div>
          
          <div className="text-center">
            <div className="text-white font-semibold">{opponent?.username}</div>
            {/* <div className="text-indigo-500 text-sm">{opponent?.elo} ELO</div> */}
            {opponentResult?.passed_all && (
              <Check className="w-5 h-5 text-emerald-500 mx-auto mt-1" />
            )}
          </div>
        </div>

        <div className="flex border-l border-slate-500 ml-2 pl-2 items-center gap-2">
          {match.status === 'active' && (
            <div className="flex items-center h-10 gap-2 text-yellow-500">
              <Clock className="w-5 h-5" />
              <span className="font-medium">In Progress</span>
            </div>
            
            
          )}
          
          {match.status === 'completed' && match.winner_id && (
            <div className={`flex items-center gap-2 ${
              match.winner_id === currentUserId ? 'text-emerald-500' : 'text-red-500'
            }`}>
              <Trophy className="w-5 h-5" />
              <span className="font-medium">
                {match.winner_id === currentUserId ? 'You Won!' : 'You Lost'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}