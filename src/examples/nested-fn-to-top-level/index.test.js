import trackSummary from '.';

describe('trackSummary', () => {
  it('should return data containing the total time, distance, and pace', () => {
    // Lisbon 38.7223° N, 9.1393° W
    // Porto 41.1579° N, 8.6291° W

    const points = [
      { time: 0, lat: 38.7223, lon: 9.1393 },
      { time: 10800, lat: 41.1579, lon: 8.6291 },
    ];

    const result = trackSummary(points);

    expect(result.time).toEqual(10800);
    expect(result.distance).toEqual(274.3);
    expect(result.pace).toEqual(0.66);
  });
});
