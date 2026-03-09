import { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';

const useSubscription = () => {
  const { plan } = useAuthContext();

  const hasFeature = useMemo(() => {
    if (!plan) return () => false;
    return (feature) => {
      const key = 'feature_' + feature;
      return !!plan[key];
    };
  }, [plan]);

  const limits = useMemo(() => ({
    maxPlayers: plan?.max_players || 25,
    maxReports: plan?.max_reports || 10,
    maxScouts: plan?.max_scouts || 1,
    maxVideoStorage: plan?.max_video_storage_gb || 0,
  }), [plan]);

  return {
    plan,
    slug: plan?.slug || 'free',
    hasFeature,
    limits,
    isPro: plan?.slug === 'pro',
    isClub: (plan?.slug || '').startsWith('club'),
    isFree: !plan || plan.slug === 'free',
  };
};

export default useSubscription;
