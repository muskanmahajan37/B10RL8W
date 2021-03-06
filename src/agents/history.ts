import { Card, History, State, Player } from '../simulator'

export type FeedBack<F> = {
  actual: number
  expected: number
  reward: number
  trace: F
  state: State
  actor: Player<F>
  action: Card
}

/**
 * Converts the history of a player from a game of Hearts into
 * an object containing feedback for every action taken by the agent
 * including the reward given to that action and the total reward
 * of all actions after that move.
 */
export function interpretHistory<F>(
  history: History<F>[],
): {
  reward: number
  feedBack: FeedBack<F>[]
  score: number
} {
  if (history.length === 0) {
    throw new Error('Game history is empty or was not terminated')
  }

  const [head, ...tail] = history

  if (head.terminal) {
    return {
      reward: head.reward,
      feedBack: [],
      score: head.actor.score,
    }
  } else {
    const rest = interpretHistory(tail)
    rest.feedBack.push({
      actual: rest.reward,
      expected: head.quality,
      reward: head.reward,
      trace: head.trace,
      state: head.state,
      actor: head.actor,
      action: head.action,
    })
    rest.reward += head.reward
    return rest
  }
}
