export function getPlanName(planKey: string): string {
  const mapping: Record<string, string> = {
    'premium': 'StealthText Premium',
    'premium+': 'StealthText Premium+', 
    'pro': 'StealthText Pro',
    'free': 'Free'
  };
  return mapping[planKey] || 'Unknown Plan';
} 

