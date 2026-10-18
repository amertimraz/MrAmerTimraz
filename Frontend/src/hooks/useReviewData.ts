import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews';

// Shared by the landing sections so they hit the API once; both fail soft (retry: 0)
// because the landing page must still render when the reviews API is unreachable.
export function useReviewHighlights() {
  return useQuery({
    queryKey: ['reviews', 'highlights'],
    queryFn: reviewsApi.getHighlights,
    retry: 0,
  });
}

export function useReviewStages() {
  return useQuery({
    queryKey: ['reviews', 'stages'],
    queryFn: reviewsApi.getStages,
    retry: 0,
  });
}
