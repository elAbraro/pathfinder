/**
 * Calculate Fit Score between student profile and university
 * Score ranges from 0-100
 */
const calculateFitScore = (studentProfile, university) => {
  let score = 0;
  let maxScore = 0;

  // 1. Academic Compatibility (30 points)
  maxScore += 30;

  // GPA Match
  if (studentProfile.academicHistory?.gpa && university.admissions?.requirements?.minGPA) {
    const gpaScore = Math.min((studentProfile.academicHistory.gpa / university.admissions.requirements.minGPA) * 15, 15);
    score += gpaScore;
  }

  // Major Availability
  if (studentProfile.interests?.desiredMajor?.length > 0 && university.academics?.majorsOffered) {
    const majorMatch = studentProfile.interests.desiredMajor.some(major =>
      university.academics.majorsOffered.some(offered =>
        offered.toLowerCase().includes(major.toLowerCase())
      )
    );
    score += majorMatch ? 15 : 0;
  }

  // 2. Test Scores Compatibility (25 points)
  maxScore += 25;
  let testScorePoints = 0;
  let testScoreCount = 0;

  // SAT
  if (studentProfile.testScores?.sat && university.admissions?.requirements?.testScores?.sat?.min) {
    const satMin = university.admissions.requirements.testScores.sat.min;
    if (studentProfile.testScores.sat >= satMin) {
      testScorePoints += 5;
    }
    testScoreCount++;
  }

  // TOEFL
  if (studentProfile.testScores?.toefl && university.admissions?.requirements?.testScores?.toefl?.min) {
    const toeflMin = university.admissions.requirements.testScores.toefl.min;
    if (studentProfile.testScores.toefl >= toeflMin) {
      testScorePoints += 5;
    }
    testScoreCount++;
  }

  // IELTS
  if (studentProfile.testScores?.ielts && university.admissions?.requirements?.testScores?.ielts?.min) {
    const ieltsMin = university.admissions.requirements.testScores.ielts.min;
    if (studentProfile.testScores.ielts >= ieltsMin) {
      testScorePoints += 5;
    }
    testScoreCount++;
  }

  // GRE
  if (studentProfile.testScores?.gre && university.admissions?.requirements?.testScores?.gre?.min) {
    const greMin = university.admissions.requirements.testScores.gre.min;
    if (studentProfile.testScores.gre >= greMin) {
      testScorePoints += 5;
    }
    testScoreCount++;
  }

  score += testScoreCount > 0 ? testScorePoints : 0;

  // 3. Financial Fit (20 points)
  maxScore += 20;
  if (studentProfile.budget?.maxTuition && university.financials?.tuitionFee?.international?.min) {
    const tuitionMin = university.financials.tuitionFee.international.min;
    const tuitionMax = university.financials.tuitionFee.international.max || tuitionMin;
    const avgTuition = (tuitionMin + tuitionMax) / 2;

    if (avgTuition <= studentProfile.budget.maxTuition) {
      score += 20;
    } else if (avgTuition <= studentProfile.budget.maxTuition * 1.2) {
      score += 10;
    }
  }

  // 4. Location Preference (15 points)
  maxScore += 15;
  if (studentProfile.interests?.preferredStudyDestinations?.length > 0) {
    const locationMatch = studentProfile.interests.preferredStudyDestinations.some(dest =>
      university.country?.toLowerCase().includes(dest.toLowerCase()) ||
      university.city?.toLowerCase().includes(dest.toLowerCase())
    );
    score += locationMatch ? 15 : 0;
  }

  // 5. Campus Preferences (10 points)
  maxScore += 10;
  if (studentProfile.interests?.campusPreferences?.length > 0 && university.campusLife?.campusType) {
    const campusMatch = studentProfile.interests.campusPreferences.some(pref =>
      university.campusLife.campusType.toLowerCase().includes(pref.toLowerCase())
    );
    score += campusMatch ? 10 : 0;
  }

  // Calculate final percentage
  const fitScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Boost for valid data to avoid 0s if data is sparse but matching
  // If we have > 0 score but low maxScore due to missing matching fields, normalize it slightly
  return Math.min(fitScore, 100);
};

// Helper to safely check nested properties
const toLowerCase = (str) => str ? str.toLowerCase() : '';

module.exports = { calculateFitScore };