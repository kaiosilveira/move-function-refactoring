function top_calculateDistance() {
  let result = 0;
  for (let i = 1; i < points.length; i += 1) {
    result += distance(points[i - 1], points[i]);
  }
  return result;
}

export default function trackSummary(points) {
  function calculateTime() {
    return points.map(p => p.time).reduce((t, p) => t + p, 0);
  }

  function radians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function distance(p1, p2) {
    // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
    const EARTH_RADIUS_IN_KM = 6371;
    const dLat = radians(p2.lat) - radians(p1.lat);
    const dLon = radians(p2.lon) - radians(p1.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
  }

  function calculateDistance() {
    let result = 0;
    for (let i = 1; i < points.length; i += 1) {
      result += distance(points[i - 1], points[i]);
    }
    return result;
  }

  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = Number((totalTime / 60 / totalDistance).toFixed(2));

  return { pace, time: totalTime, distance: totalDistance };
}
