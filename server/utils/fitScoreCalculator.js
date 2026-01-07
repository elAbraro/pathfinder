/**
 * Calculate Fit Score between student profile and university
 * Score ranges from 0-100
 */
const calculateFitScore = (studentProfile, university) => {
  let score = 0;

  // Weights (Total 100)
  const weights = {
    academic: 35,
    financial: 25,
    preference: 20,
    quality: 20
  };

  // 1. Academic Compatibility (35 points) - GPA & Test Scores
  let academicScore = 0;
  let academicCount = 0;

  // GPA Match
  if (studentProfile.academicHistory?.gpa && university.admissions?.requirements?.minGPA) {
    const gpaRatio = studentProfile.academicHistory.gpa / university.admissions.requirements.minGPA;
    academicScore += Math.min(gpaRatio * 17.5, 17.5); // Max 17.5
    academicCount++;
  }

  // Test Scores (SAT/IELTS/TOEFL)
  if (studentProfile.testScores?.sat && university.admissions?.requirements?.testScores?.sat?.min) {
    if (studentProfile.testScores.sat >= university.admissions.requirements.testScores.sat.min) academicScore += 17.5;
    else academicScore += (studentProfile.testScores.sat / university.admissions.requirements.testScores.sat.min) * 10;
    academicCount++;
  } else if (studentProfile.testScores?.ielts && university.admissions?.requirements?.testScores?.ielts?.min) {
    if (studentProfile.testScores.ielts >= university.admissions.requirements.testScores.ielts.min) academicScore += 17.5;
    academicCount++;
  }

  score += academicCount > 0 ? Math.min(academicScore, weights.academic) : (weights.academic * 0.5); // Baseline if half-data

  // 2. Financial Fit (25 points) - Budget vs Tuition
  let financialScore = 0;
  if (studentProfile.budget?.maxTuition && university.financials?.tuitionFee?.international?.min) {
    const tuitionMin = university.financials.tuitionFee.international.min;
    const tuitionMax = university.financials.tuitionFee.international.max || tuitionMin;
    const avgTuition = (tuitionMin + tuitionMax) / 2;

    if (avgTuition <= studentProfile.budget.maxTuition) {
      financialScore = weights.financial;
    } else if (avgTuition <= studentProfile.budget.maxTuition * 1.3) {
      financialScore = weights.financial * 0.6;
    } else if (avgTuition <= studentProfile.budget.maxTuition * 1.6) {
      financialScore = weights.financial * 0.3;
    }
  } else {
    financialScore = weights.financial * 0.5; // Neutral
  }
  score += financialScore;

  // 3. Preference (20 points) - Majors & Country
  let preferenceScore = 0;

  // Major Match (10 pts)
  if (studentProfile.interests?.desiredMajor?.length > 0 && university.academics?.majorsOffered) {
    const majorMatch = studentProfile.interests.desiredMajor.some(major =>
      university.academics.majorsOffered.some(offered =>
        offered.toLowerCase().includes(major.toLowerCase())
      )
    );
    if (majorMatch) preferenceScore += 10;
  }

  // Country/Location Match (10 pts)
  if (studentProfile.interests?.preferredStudyDestinations?.length > 0) {
    const locationMatch = studentProfile.interests.preferredStudyDestinations.some(dest =>
      university.country?.toLowerCase().includes(dest.toLowerCase())
    );
    if (locationMatch) preferenceScore += 10;
  }

  score += preferenceScore > 0 ? preferenceScore : (weights.preference * 0.4);

  // 4. Quality (20 points) - Ranking & Research
  let qualityScore = 0;
  const globalRank = university.ranking?.global || 1000;

  if (globalRank <= 100) qualityScore = weights.quality;
  else if (globalRank <= 500) qualityScore = weights.quality * 0.75;
  else if (globalRank <= 1000) qualityScore = weights.quality * 0.5;
  else qualityScore = weights.quality * 0.25;

  score += qualityScore;

  return Math.min(Math.round(score), 100);
};

// Helper to safely check nested properties
const toLowerCase = (str) => str ? str.toLowerCase() : '';

module.exports = { calculateFitScore };