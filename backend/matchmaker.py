import threading
import time
import logging
import random
from supabase_client import supabase
from uuid import uuid4

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Matchmaker:
    def __init__(self, interval=2):
        self.interval = interval
        self.running = False
        self.thread = None
    
    def start(self):
        """Start the matchmaking loop"""
        if self.running:
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._matchmaking_loop, daemon=True)
        self.thread.start()
        logger.info('Matchmaker started')
    
    def stop(self):
        """Stop the matchmaking loop"""
        self.running = False
        if self.thread:
            self.thread.join()
        logger.info('Matchmaker stopped')
    
    def _matchmaking_loop(self):
        """Continuously check for matches"""
        while self.running:
            try:
                # Match ranked players
                self._create_matches('ranked')
                # Match casual players
                self._create_matches('casual')
            except Exception as e:
                logger.error(f'Matchmaking error: {str(e)}')
            
            time.sleep(self.interval)
    
    def _get_difficulty_for_elo(self, avg_elo):
        """Determine problem difficulty based on average ELO"""
        if avg_elo < 1100:
            return 'easy'
        elif avg_elo < 1300:
            # 70% easy, 30% medium for lower intermediate
            return random.choices(['easy', 'medium'], weights=[70, 30])[0]
        elif avg_elo < 1500:
            # Balanced for mid-tier
            return random.choices(['easy', 'medium', 'hard'], weights=[20, 60, 20])[0]
        elif avg_elo < 1700:
            # 30% medium, 70% hard for upper intermediate
            return random.choices(['medium', 'hard'], weights=[30, 70])[0]
        else:
            # Mostly hard for experts
            return random.choices(['medium', 'hard'], weights=[10, 90])[0]
    
    def _create_matches(self, mode='ranked'):
        """Find pairs in queue and create matches with ELO-based difficulty"""
        # Get oldest 2 users in queue for this mode WITH their profile data
        result = supabase.table('match_queue')\
            .select('*, profiles!match_queue_profile_id_fkey(id, elo, username)')\
            .eq('mode', mode)\
            .order('joined_at')\
            .limit(2)\
            .execute()
        
        queue_entries = result.data
        
        if len(queue_entries) < 2:
            return
        
        player1 = queue_entries[0]
        player2 = queue_entries[1]
        
        player1_id = player1['profile_id']
        player2_id = player2['profile_id']
        
        # CRITICAL FIX: Verify neither player has an active match already
        # This prevents re-matching players who haven't left their previous match
        try:
            active_matches = supabase.table('matches')\
                .select('id, player1_id, player2_id')\
                .eq('status', 'active')\
                .or_(f'player1_id.in.({player1_id},{player2_id}),player2_id.in.({player1_id},{player2_id})')\
                .execute()
            
            if active_matches.data:
                # One or both players have active matches - remove them from queue
                affected_players = set()
                for match in active_matches.data:
                    if match['player1_id'] in [player1_id, player2_id]:
                        affected_players.add(match['player1_id'])
                    if match['player2_id'] in [player1_id, player2_id]:
                        affected_players.add(match['player2_id'])
                
                for player_id in affected_players:
                    supabase.table('match_queue')\
                        .delete()\
                        .eq('profile_id', player_id)\
                        .execute()
                    logger.info(f"Removed player {player_id} from queue - already in active match")
                
                return  # Skip this matching cycle
                
        except Exception as e:
            logger.error(f"Error checking active matches: {str(e)}")
            return
        
        # Calculate average ELO
        player1_elo = player1['profiles']['elo']
        player2_elo = player2['profiles']['elo']
        avg_elo = (player1_elo + player2_elo) / 2
        
        # Determine difficulty based on average ELO
        target_difficulty = self._get_difficulty_for_elo(avg_elo)
        
        logger.info(f"[{mode.upper()}] Matching players: {player1['profiles']['username']} (ELO: {player1_elo}) vs {player2['profiles']['username']} (ELO: {player2_elo}) - Avg: {avg_elo:.0f} - Target: {target_difficulty}")
        
        # Get problems of target difficulty
        problem_result = supabase.table('problems')\
            .select('id, title, difficulty')\
            .eq('difficulty', target_difficulty)\
            .execute()
        
        # Fallback: if no problems of target difficulty, get any problem
        if not problem_result.data:
            logger.warning(f'No {target_difficulty} problems available, falling back to any difficulty')
            problem_result = supabase.table('problems')\
                .select('id, title, difficulty')\
                .execute()
        
        if not problem_result.data:
            logger.error('No problems available at all')
            return
        
        # Pick a random problem from the difficulty tier
        selected_problem = random.choice(problem_result.data)
        problem_id = selected_problem['id']
        
        try:
            # Create match with mode
            match_data = {
                'player1_id': player1_id,
                'player2_id': player2_id,
                'problem_id': problem_id,
                'status': 'active',
                'mode': mode,
                'player1_result': {},
                'player2_result': {}
            }
            
            match_result = supabase.table('matches').insert(match_data).execute()
            
            # CRITICAL: Remove BOTH players from queue immediately after match creation
            try:
                supabase.table('match_queue').delete().eq('id', player1['id']).execute()
                logger.info(f"Removed {player1['profiles']['username']} from queue")
            except Exception as e:
                logger.error(f"Failed to remove player1 from queue: {str(e)}")
            
            try:
                supabase.table('match_queue').delete().eq('id', player2['id']).execute()
                logger.info(f"Removed {player2['profiles']['username']} from queue")
            except Exception as e:
                logger.error(f"Failed to remove player2 from queue: {str(e)}")
            
            logger.info(f"✓ [{mode.upper()}] Match created: {match_result.data[0]['id']}")
            logger.info(f"  Problem: '{selected_problem['title']}' ({selected_problem['difficulty']})")
            logger.info(f"  Players: {player1['profiles']['username']} vs {player2['profiles']['username']}")
            
        except Exception as e:
            logger.error(f'Failed to create {mode} match: {str(e)}')