import { calculateRating } from './rating.helper';

describe('calculateRating', () => {
  it('should return null rating and 0 count when reviews array is empty', () => {
    const result = calculateRating([]);
    expect(result).toEqual({ rating: null, reviewCount: 0 });
  });

  it('should return null rating and 0 count when reviews is null or undefined', () => {
    expect(calculateRating(null)).toEqual({ rating: null, reviewCount: 0 });
    expect(calculateRating(undefined)).toEqual({ rating: null, reviewCount: 0 });
  });

  it('should calculate the correct average rating rounded to 1 decimal place', () => {
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }];
    const result = calculateRating(reviews);
    // (5 + 4 + 4) / 3 = 4.3333... -> 4.3
    expect(result.rating).toBe(4.3);
    expect(result.reviewCount).toBe(3);
  });

  it('should filter out invalid reviews with null or NaN ratings', () => {
    const reviews = [
      { rating: 5 },
      { rating: null },
      { rating: undefined },
      { rating: 'not-a-number' as any },
      { rating: 3 },
    ];
    const result = calculateRating(reviews);
    // (5 + 3) / 2 = 4.0
    expect(result.rating).toBe(4);
    expect(result.reviewCount).toBe(2);
  });

  it('should support stringified numeric ratings', () => {
    const reviews = [{ rating: '5' as any }, { rating: '4' as any }];
    const result = calculateRating(reviews);
    expect(result.rating).toBe(4.5);
    expect(result.reviewCount).toBe(2);
  });
});
