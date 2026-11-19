export const WEIGHTS = {
  category: 30,
  location: 20,
  supportType: 25,
  targetAudience: 15,
  eventType: 10
};

export const LABEL_THRESHOLDS = {
  'Sangat Direkomendasikan': { min: 85, max: 100 },
  'Direkomendasikan': { min: 70, max: 84 },
  'Cukup Relevan': { min: 50, max: 69 },
  'Alternatif': { min: 0, max: 49 }
};

export function calculateScore(sponsor, eventProfile) {
  let score = 0;

  // Category match (30 pts)
  if (sponsor.category && eventProfile.category &&
      sponsor.category.toLowerCase() === eventProfile.category.toLowerCase()) {
    score += WEIGHTS.category;
  }

  // Location match (20 pts)
  if (sponsor.location === 'Seluruh Indonesia' ||
      (sponsor.location && eventProfile.location && sponsor.location === eventProfile.location)) {
    score += WEIGHTS.location;
  }

  // Support type match (up to 25 pts, 5 per matched type)
  const neededSupport = Array.isArray(eventProfile.neededSupport) ? eventProfile.neededSupport : [];
  if (neededSupport.length > 0 && Array.isArray(sponsor.supportTypes)) {
    const matched = neededSupport.filter(s => sponsor.supportTypes.includes(s));
    score += Math.min(matched.length * 5, WEIGHTS.supportType);
  }

  // Target audience match (15 pts)
  const neededAudience = Array.isArray(eventProfile.targetAudience) ? eventProfile.targetAudience : [];
  if (neededAudience.length > 0 && Array.isArray(sponsor.targetAudience)) {
    const matched = neededAudience.filter(a => sponsor.targetAudience.includes(a));
    if (matched.length > 0) score += WEIGHTS.targetAudience;
  }

  // Event type match (10 pts)
  if (eventProfile.eventType && Array.isArray(sponsor.suitableEvents)) {
    if (sponsor.suitableEvents.includes(eventProfile.eventType) ||
        sponsor.suitableEvents.includes('Semua Jenis Acara')) {
      score += WEIGHTS.eventType;
    }
  }

  return Math.min(score, 100);
}

export function classifyScore(score) {
  if (score >= 85) return 'Sangat Direkomendasikan';
  if (score >= 70) return 'Direkomendasikan';
  if (score >= 50) return 'Cukup Relevan';
  return 'Alternatif';
}

export function getLabelColor(label) {
  const map = {
    'Sangat Direkomendasikan': '#16A36A',
    'Direkomendasikan': '#315D8A',
    'Cukup Relevan': '#E6A23C',
    'Alternatif': '#718096'
  };
  return map[label] || '#718096';
}

export function getLabelBg(label) {
  const map = {
    'Sangat Direkomendasikan': '#d1fae5',
    'Direkomendasikan': '#dbeafe',
    'Cukup Relevan': '#fef3c7',
    'Alternatif': '#f3f4f6'
  };
  return map[label] || '#f3f4f6';
}

export function runMatching(eventProfile, sponsors) {
  return sponsors
    .map(s => {
      const score = calculateScore(s, eventProfile);
      return { ...s, score, label: classifyScore(score) };
    })
    .sort((a, b) => b.score - a.score);
}