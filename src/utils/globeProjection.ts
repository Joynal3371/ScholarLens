export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  visible: boolean;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Projects geographic coordinates (lat, lng in degrees) onto a 2D orthographic
 * sphere centered at (centerLat, centerLng) with radius R.
 */
export function projectOrthographic(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radius: number
): ProjectedPoint {
  const phi = lat * DEG_TO_RAD;
  const lambda = lng * DEG_TO_RAD;
  const phi0 = centerLat * DEG_TO_RAD;
  const lambda0 = centerLng * DEG_TO_RAD;

  const dLambda = lambda - lambda0;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinPhi0 = Math.sin(phi0);
  const cosPhi0 = Math.cos(phi0);
  const cosDLambda = Math.cos(dLambda);

  // Cosine of angular distance from center of projection
  const cosC = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDLambda;

  const x = radius * cosPhi * Math.sin(dLambda);
  const y = -radius * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDLambda);

  return {
    x,
    y,
    z: cosC,
    visible: cosC >= 0,
  };
}

/**
 * Computes intermediate points along a spherical great-circle arc between two (lat, lng) points.
 */
export function interpolateGreatCircle(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  steps: number = 32
): { lat: number; lng: number }[] {
  const phi1 = lat1 * DEG_TO_RAD;
  const lam1 = lng1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const lam2 = lng2 * DEG_TO_RAD;

  const d =
    2 *
    Math.asin(
      Math.min(
        1,
        Math.sqrt(
          Math.pow(Math.sin((phi1 - phi2) / 2), 2) +
            Math.cos(phi1) *
              Math.cos(phi2) *
              Math.pow(Math.sin((lam1 - lam2) / 2), 2)
        )
      )
    );

  if (d < 1e-6) {
    return [
      { lat: lat1, lng: lng1 },
      { lat: lat2, lng: lng2 },
    ];
  }

  const points: { lat: number; lng: number }[] = [];
  const sinD = Math.sin(d);

  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / sinD;
    const B = Math.sin(f * d) / sinD;

    const x =
      A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
    const y =
      A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);

    const phi = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lam = Math.atan2(y, x);

    points.push({
      lat: phi * RAD_TO_DEG,
      lng: lam * RAD_TO_DEG,
    });
  }

  return points;
}

/**
 * Simplified continental landmass polygons [lat, lng][] for rendering the 3D globe without external GeoJSON calls.
 */
export const CONTINENT_POLYGONS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'North America',
    coords: [
      [70, -160],
      [71, -130],
      [68, -95],
      [62, -75],
      [52, -56],
      [45, -61],
      [41, -70],
      [35, -75],
      [25, -80],
      [28, -95],
      [20, -105],
      [15, -92],
      [8, -78],
      [18, -104],
      [24, -110],
      [33, -118],
      [40, -124],
      [49, -125],
      [58, -137],
      [61, -150],
      [60, -165],
    ],
  },
  {
    name: 'Greenland',
    coords: [
      [82, -45],
      [78, -20],
      [70, -24],
      [60, -44],
      [68, -54],
      [76, -68],
    ],
  },
  {
    name: 'South America',
    coords: [
      [11, -75],
      [10, -62],
      [2, -50],
      [-5, -35],
      [-15, -39],
      [-23, -43],
      [-34, -53],
      [-42, -64],
      [-54, -68],
      [-50, -75],
      [-35, -72],
      [-18, -71],
      [-5, -81],
      [4, -77],
    ],
  },
  {
    name: 'Europe',
    coords: [
      [71, 28],
      [68, 15],
      [60, 5],
      [54, 8],
      [51, 2],
      [48, -4],
      [43, -9],
      [36, -6],
      [38, 0],
      [42, 3],
      [44, 9],
      [40, 18],
      [38, 24],
      [42, 28],
      [46, 32],
      [55, 38],
      [65, 40],
    ],
  },
  {
    name: 'UK & Ireland',
    coords: [
      [58, -6],
      [57, -2],
      [51, 1],
      [50, -5],
      [54, -8],
    ],
  },
  {
    name: 'Africa',
    coords: [
      [36, -6],
      [37, 10],
      [32, 15],
      [31, 32],
      [22, 37],
      [12, 44],
      [11, 51],
      [2, 45],
      [-10, 40],
      [-25, 35],
      [-34, 25],
      [-34, 18],
      [-20, 13],
      [-6, 12],
      [4, 9],
      [5, -4],
      [10, -15],
      [15, -17],
      [25, -15],
    ],
  },
  {
    name: 'Asia',
    coords: [
      [68, 40],
      [73, 80],
      [72, 120],
      [66, 170],
      [55, 160],
      [52, 140],
      [40, 128],
      [35, 120],
      [22, 114],
      [12, 108],
      [2, 103],
      [15, 98],
      [22, 88],
      [8, 77],
      [20, 72],
      [25, 65],
      [25, 56],
      [13, 45],
      [28, 34],
      [36, 36],
      [41, 29],
      [46, 38],
    ],
  },
  {
    name: 'Japan',
    coords: [
      [44, 142],
      [39, 141],
      [35, 140],
      [32, 131],
      [35, 133],
      [41, 140],
    ],
  },
  {
    name: 'Australia',
    coords: [
      [-12, 131],
      [-12, 142],
      [-20, 149],
      [-28, 153],
      [-38, 147],
      [-35, 136],
      [-32, 128],
      [-34, 115],
      [-22, 114],
      [-16, 123],
    ],
  },
];
