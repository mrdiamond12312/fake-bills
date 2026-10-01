export type TProjectorSettings = {
  /** Lengthwise curl, 0 = flat, 1 = half a cylinder */
  curl: number;
  /** Curl toward (1) or away from (-1) the camera */
  curlDirection: 1 | -1;
  /** Sideways cupping across the paper width */
  cup: number;
  /** Soft ripples along the paper */
  wave: number;
  waveFrequency: number;
  /** Degrees */
  tiltX: number;
  tiltY: number;
  roll: number;
  zoom: number;
  lightIntensity: number;
  /** Degrees around the paper */
  lightAngle: number;
  shadow: boolean;
  background: string;
  /** Camera blur in px */
  blur: number;
  /** Sensor noise 0–0.5 */
  noise: number;
  autoSpin: boolean;
};

export const DEFAULT_PROJECTOR_SETTINGS: TProjectorSettings = {
  curl: 0.25,
  curlDirection: 1,
  cup: 0.15,
  wave: 0.2,
  waveFrequency: 3,
  tiltX: -12,
  tiltY: 8,
  roll: -4,
  zoom: 1,
  lightIntensity: 1.6,
  lightAngle: 35,
  shadow: true,
  background: '#6b5b4b',
  blur: 0,
  noise: 0.04,
  autoSpin: false,
};

export const BACKGROUND_PRESETS = [
  { label: 'Wood', value: '#6b5b4b' },
  { label: 'Desk', value: '#d9d6cf' },
  { label: 'Dark', value: '#1f2226' },
  { label: 'Steel', value: '#8d9399' },
  { label: 'Blue', value: '#1c3f6e' },
];

const between = (min: number, max: number) => min + Math.random() * (max - min);

/** One OCR augmentation sample: random pose, curl, light and camera quality. */
export const randomProjectorSettings = (current: TProjectorSettings): TProjectorSettings => ({
  ...current,
  curl: between(0, 0.6),
  curlDirection: Math.random() > 0.3 ? 1 : -1,
  cup: between(-0.3, 0.4),
  wave: between(0, 0.5),
  waveFrequency: between(1.5, 6),
  tiltX: between(-35, 20),
  tiltY: between(-30, 30),
  roll: between(-25, 25),
  zoom: between(0.85, 1.25),
  lightIntensity: between(0.8, 2.4),
  lightAngle: between(0, 360),
  background: BACKGROUND_PRESETS[Math.floor(Math.random() * BACKGROUND_PRESETS.length)].value,
  blur: Math.random() > 0.6 ? between(0, 1.5) : 0,
  noise: between(0, 0.12),
});
