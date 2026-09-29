export const CORRECT_ANSWER_REWARD = 3;

export function rewardCorrectAnswer(state, exerciseId) {
  return {
    ...state,
    stars: state.stars + CORRECT_ANSWER_REWARD,
    completedExercises: { ...state.completedExercises, [exerciseId]: true },
  };
}
