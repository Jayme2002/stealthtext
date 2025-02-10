export function getPlanName(priceId: string): string {
  const mapping: Record<string, string> = {
    'price_1Qq5NqFfiJfL6EMieNtdAzFk': 'Premium',
    'price_1Qq5TAFfiJfL6EMiBcQHGdUx': 'Premium+', // Replace with actual Premium+ price ID
    'price_1QqMstFfiJfL6EMinLoK8xcj': 'Pro' // Replace with actual Pro price ID
  };
  return mapping[priceId] || 'Unknown Plan';
} 

