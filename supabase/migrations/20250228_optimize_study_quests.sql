
-- Create a function that handles all study-related quest updates in a single transaction
CREATE OR REPLACE FUNCTION public.update_study_quests(
  user_id_param UUID,
  minutes_studied INTEGER,
  accuracy_percent INTEGER,
  streak_count INTEGER
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  today_start TIMESTAMP;
  today_end TIMESTAMP;
  time_quest RECORD;
  accuracy_quest RECORD;
  streak_quest RECORD;
BEGIN
  today_start := date_trunc('day', now() AT TIME ZONE 'UTC');
  today_end := today_start + interval '1 day';

  -- Begin a single transaction for all updates
  BEGIN
    -- Update time-based quests
    FOR time_quest IN
      SELECT *
      FROM user_quests uq
      JOIN quests q ON q.id = uq.quest_id
      WHERE uq.user_id = user_id_param
      AND q.type = 'infinite'
      AND uq.expires_at >= now()
      AND (uq.progress < minutes_studied OR uq.progress < q.requirement_count)
    LOOP
      UPDATE user_quests
      SET 
        progress = LEAST(minutes_studied, time_quest.requirement_count),
        completed = minutes_studied >= time_quest.requirement_count,
        completed_at = CASE WHEN minutes_studied >= time_quest.requirement_count AND NOT time_quest.completed 
                       THEN now() ELSE completed_at END
      WHERE id = time_quest.id;
    END LOOP;

    -- Update accuracy-based quests
    FOR accuracy_quest IN
      SELECT *
      FROM user_quests uq
      JOIN quests q ON q.id = uq.quest_id
      WHERE uq.user_id = user_id_param
      AND q.type IN ('playlist_public', 'playlist_private')
      AND uq.expires_at >= now()
      AND (uq.progress < accuracy_percent OR uq.progress < q.requirement_count)
    LOOP
      UPDATE user_quests
      SET 
        progress = GREATEST(accuracy_percent, progress),
        completed = accuracy_percent >= accuracy_quest.requirement_count,
        completed_at = CASE WHEN accuracy_percent >= accuracy_quest.requirement_count AND NOT accuracy_quest.completed 
                       THEN now() ELSE completed_at END
      WHERE id = accuracy_quest.id;
    END LOOP;

    -- Update streak-based quests
    FOR streak_quest IN
      SELECT *
      FROM user_quests uq
      JOIN quests q ON q.id = uq.quest_id
      WHERE uq.user_id = user_id_param
      AND q.type = 'mastery'
      AND uq.expires_at >= now()
      AND (uq.progress < streak_count OR uq.progress < q.requirement_count)
    LOOP
      UPDATE user_quests
      SET 
        progress = GREATEST(streak_count, progress),
        completed = streak_count >= streak_quest.requirement_count,
        completed_at = CASE WHEN streak_count >= streak_quest.requirement_count AND NOT streak_quest.completed 
                       THEN now() ELSE completed_at END
      WHERE id = streak_quest.id;
    END LOOP;
  END;
END;
$$;

-- Create a function to consolidate multiple streak updates
CREATE OR REPLACE FUNCTION public.batch_update_user_streak(
  user_id_param UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_activity_date only if it hasn't been updated already today
  UPDATE user_streaks
  SET last_activity_date = CURRENT_DATE
  WHERE user_id = user_id_param
  AND last_activity_date < CURRENT_DATE;
END;
$$;
