export function getPlanName(planKey: string): string {
  const mapping: Record<string, string> = {
    'premium': 'Premium',
    'premium+': 'Premium+', 
    'pro': 'Pro',
    'free': 'Free'
  };
  return mapping[planKey] || 'Unknown Plan';
}