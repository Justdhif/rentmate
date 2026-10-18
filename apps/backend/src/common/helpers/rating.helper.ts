export interface RatingSummary {
  rating: number | null;
  reviewCount: number;
}

/**
 * Calculates average rating rounded to 1 decimal place.
 * Returns null if no valid reviews are provided.
 */
export function calculateRating(
  reviews?: Array<{ rating?: number | string | null }> | null,
): RatingSummary {
  if (!reviews || reviews.length === 0) {
    return { rating: null, reviewCount: 0 };
  }

  const validReviews = reviews.filter(
    (r) =>
      r !== null &&
      r !== undefined &&
      r.rating !== null &&
      r.rating !== undefined &&
      !isNaN(Number(r.rating)),
  );

  if (validReviews.length === 0) {
    return { rating: null, reviewCount: 0 };
  }

  const totalScore = validReviews.reduce(
    (sum, r) => sum + Number(r.rating),
    0,
  );
  const rating = Math.round((totalScore / validReviews.length) * 10) / 10;

  return {
    rating,
    reviewCount: validReviews.length,
  };
}
