// utils/profileLogic.js

export const calculateProfileScore = (profileData, aiScore = 10) => {
  let score = 0;

  // Academic (max 40)
  if (profileData.gpa) {
    if (profileData.gpa >= 3.5) score += 20;
    else if (profileData.gpa >= 3.0) score += 15;
    else if (profileData.gpa >= 2.5) score += 10;
    else score += 5;
  }

  // Test readiness (max 20)
  if (profileData.testStatus === 'completed') score += 10;
  if (profileData.greStatus === 'completed') score += 10;

  // Financial (max 20)
  if (profileData.budget >= 30000) score += 20;
  else if (profileData.budget >= 20000) score += 15;
  else if (profileData.budget >= 10000) score += 10;
  else score += 5;

  // AI score (max 20)
  score += Math.min(aiScore, 20);

  return Math.min(score, 100);
};

export const determineCurrentStage = (context) => {
  const score = context.profileScore || 0;
  const lockedCount = context.lockedUniversities?.length || 0;
  const shortlistedCount = context.shortlistedUniversities?.length || 0;

  if (score < 30) return 1;
  if (score >= 30 && shortlistedCount < 3) return 2;
  if (score >= 50 && lockedCount > 0) return 3;
  if (score >= 70 && lockedCount >= 3) return 4;
  if (score >= 80 && context.testStatus === 'completed' && context.sopStatus === 'ready') return 5;

  return score < 50 ? 2 : score < 70 ? 3 : 4;
};