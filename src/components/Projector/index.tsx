import {
  CameraOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useIntl } from '@umijs/max';
import {
  Button,
  Col,
  Flex,
  Row,
  Segmented,
  Slider,
  Spin,
  Switch,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import classNames from 'classnames';
import { toCanvas } from 'html-to-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import {
  BACKGROUND_PRESETS,
  DEFAULT_PROJECTOR_SETTINGS,
  randomProjectorSettings,
  TProjectorSettings,
} from '@/components/Projector/helpers/settings';
import { PAPER_WORLD_WIDTH, ReceiptMesh } from '@/components/Projector/ReceiptMesh';

const FOV = 38;

/** Keeps the whole receipt in frame when its length or the zoom changes. */
const CameraRig: React.FC<{ aspect: number; zoom: number }> = ({ aspect, zoom }) => {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    const height = PAPER_WORLD_WIDTH * aspect;
    const distance = (height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) * 1.2;
    camera.position.set(0, 0, distance / zoom);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, aspect, zoom]);
  return null;
};

const makeNoiseDataUrl = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
};

type TProjector = {
  /** The 1:1 bill node to project */
  sourceRef: React.RefObject<HTMLElement>;
  /** Changes whenever the bill content changes → texture is re-captured */
  version: unknown;
  fileName?: string;
};

const Projector: React.FC<TProjector> = ({ sourceRef, version, fileName = 'bill-projected' }) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });
  const [settings, setSettings] = useState<TProjectorSettings>(DEFAULT_PROJECTOR_SETTINGS);
  const [texture, setTexture] = useState<THREE.CanvasTexture>();
  const [aspect, setAspect] = useState(2.5);
  const [capturing, setCapturing] = useState(false);
  // settingsMounted keeps the panel in the DOM; settingsClosing plays the exit fade
  // before unmounting, so there's a fade-out and not just an instant removal.
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const settingsOpen = settingsMounted && !settingsClosing;
  const toggleSettings = () => {
    if (settingsOpen) {
      setSettingsClosing(true);
      setTimeout(() => {
        setSettingsMounted(false);
        setSettingsClosing(false);
      }, 200);
    } else {
      setSettingsClosing(false);
      setSettingsMounted(true);
    }
  };
  const glRef = useRef<HTMLCanvasElement>();
  const noiseUrl = useMemo(makeNoiseDataUrl, []);

  // Measure the space the canvas can take (root minus the sticky action row) so the
  // react-three-fiber Canvas always gets a definite height. Floored so it never collapses.
  const CANVAS_MIN_HEIGHT = 400;
  const rootRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_MIN_HEIGHT);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rootH = root.clientHeight;
      const actionH = actionRef.current?.offsetHeight ?? 0;
      const gap = 12; // Flex vertical gap={12}
      setCanvasHeight(Math.max(CANVAS_MIN_HEIGHT, rootH - actionH - gap));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    if (actionRef.current) observer.observe(actionRef.current);
    return () => observer.disconnect();
  }, []);

  const update = <K extends keyof TProjectorSettings>(key: K, value: TProjectorSettings[K]) =>
    setSettings((previous) => ({ ...previous, [key]: value }));

  // Rasterise the flat bill into a texture (debounced while the form is being edited)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!sourceRef.current) return;
      const canvas = await toCanvas(sourceRef.current, { pixelRatio: 2 });
      if (cancelled) return;
      const next = new THREE.CanvasTexture(canvas);
      next.colorSpace = THREE.SRGBColorSpace;
      next.anisotropy = 16;
      next.minFilter = THREE.LinearMipmapLinearFilter;
      setAspect(canvas.height / canvas.width);
      setTexture((previous) => {
        previous?.dispose();
        return next;
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sourceRef, version]);

  const handleCapture = useCallback(async () => {
    const source = glRef.current;
    if (!source) return;
    setCapturing(true);
    try {
      const output = document.createElement('canvas');
      output.width = source.width;
      output.height = source.height;
      const context = output.getContext('2d')!;
      context.filter = settings.blur ? `blur(${settings.blur}px)` : 'none';
      context.drawImage(source, 0, 0);
      context.filter = 'none';
      if (settings.noise > 0) {
        const noise = new Image();
        noise.src = noiseUrl;
        await noise.decode();
        context.globalAlpha = settings.noise;
        context.globalCompositeOperation = 'overlay';
        context.fillStyle = context.createPattern(noise, 'repeat')!;
        context.fillRect(0, 0, output.width, output.height);
      }
      const anchor = document.createElement('a');
      anchor.href = output.toDataURL('image/png');
      anchor.download = `${fileName}-${Date.now()}.png`;
      anchor.click();
    } finally {
      setCapturing(false);
    }
  }, [settings.blur, settings.noise, noiseUrl, fileName]);

  const lightPosition = useMemo<[number, number, number]>(() => {
    const angle = THREE.MathUtils.degToRad(settings.lightAngle);
    return [Math.cos(angle) * 6, Math.sin(angle) * 6, 8];
  }, [settings.lightAngle]);

  const slider = (
    key: keyof TProjectorSettings,
    label: string,
    min: number,
    max: number,
    step = 0.01,
  ) => (
    <Col span={12} md={8} key={key}>
      <Typography.Text className="text-body-3-medium">{label}</Typography.Text>
      <Slider
        min={min}
        max={max}
        step={step}
        value={settings[key] as number}
        onChange={(value) => update(key, value as any)}
      />
    </Col>
  );

  return (
    <Flex ref={rootRef} vertical gap={12} className="h-full">
      <Flex
        ref={actionRef}
        gap={8}
        wrap
        className="sticky top-0 z-10 py-3"
        style={{ backgroundColor: token.colorBgContainer }}
      >
        <Button
          type="primary"
          icon={<CameraOutlined />}
          loading={capturing}
          onClick={handleCapture}
        >
          {t('projector.capture', 'Capture PNG')}
        </Button>
        <Button
          icon={<ExperimentOutlined />}
          onClick={() => setSettings((previous) => randomProjectorSettings(previous))}
        >
          {t('projector.randomize', 'Randomize')}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => setSettings(DEFAULT_PROJECTOR_SETTINGS)}>
          {t('projector.reset', 'Reset')}
        </Button>
        <Button
          type={settingsOpen ? 'primary' : 'default'}
          ghost={settingsOpen}
          icon={<SettingOutlined />}
          onClick={toggleSettings}
          aria-pressed={settingsOpen}
          className="ml-auto"
        >
          {t('projector.settings', 'Settings')}
        </Button>
      </Flex>

      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ height: canvasHeight, background: settings.background }}
      >
        {texture ? (
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            camera={{ fov: FOV, position: [0, 0, 10] }}
            onCreated={({ gl }) => {
              glRef.current = gl.domElement;
            }}
            style={{ filter: settings.blur ? `blur(${settings.blur}px)` : undefined }}
          >
            <color attach="background" args={[settings.background]} />
            <CameraRig aspect={aspect} zoom={settings.zoom} />
            <ambientLight intensity={0.45} />
            <hemisphereLight args={['#fff8ee', '#3a3025', 0.35]} />
            <directionalLight
              position={lightPosition}
              intensity={settings.lightIntensity}
              castShadow={settings.shadow}
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-8}
              shadow-camera-right={8}
              shadow-camera-top={8}
              shadow-camera-bottom={-8}
            />
            <ReceiptMesh texture={texture} aspect={aspect} settings={settings} />
            <mesh position={[0, 0, -1.2]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial color={settings.background} roughness={1} />
            </mesh>
            <OrbitControls
              makeDefault
              enableDamping
              autoRotate={settings.autoSpin}
              autoRotateSpeed={2}
            />
          </Canvas>
        ) : (
          <Flex justify="center" align="center" className="h-full">
            <Spin />
          </Flex>
        )}
        {settings.noise > 0 ? (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{ backgroundImage: `url(${noiseUrl})`, opacity: settings.noise }}
          />
        ) : null}

        {/* Spin / shadow quick toggles overlaid in the canvas corner. */}
        <Flex
          gap={6}
          align="center"
          className="absolute right-3 top-3 z-10 rounded-lg px-3 py-1 shadow-sm"
          style={{ backgroundColor: token.colorBgElevated }}
        >
          <Typography.Text className="text-body-3-medium">
            {t('projector.spin', 'Spin')}
          </Typography.Text>
          <Switch
            size="small"
            checked={settings.autoSpin}
            onChange={(value) => update('autoSpin', value)}
          />
          <Typography.Text className="text-body-3-medium ml-2">
            {t('projector.shadow', 'Shadow')}
          </Typography.Text>
          <Switch
            size="small"
            checked={settings.shadow}
            onChange={(value) => update('shadow', value)}
          />
        </Flex>

        {/* Settings overlay the bottom of the canvas instead of pushing layout below it. */}
        {settingsMounted ? (
          <div
            className={classNames(
              'absolute inset-x-0 bottom-0 max-h-[60%] overflow-auto rounded-b-lg p-3 shadow-lg',
              settingsClosing ? 'fade-out' : 'fade-in',
            )}
            style={{ backgroundColor: token.colorBgElevated }}
          >
            <Row gutter={[16, 0]}>
              {slider('curl', t('projector.curl', 'Curl'), 0, 1)}
              {slider('cup', t('projector.cup', 'Cup'), -0.6, 0.6)}
              {slider('wave', t('projector.wave', 'Wave'), 0, 1)}
              {slider('waveFrequency', t('projector.waveFrequency', 'Wave frequency'), 0.5, 8, 0.1)}
              {slider('tiltX', t('projector.tiltX', 'Tilt X°'), -70, 70, 1)}
              {slider('tiltY', t('projector.tiltY', 'Tilt Y°'), -70, 70, 1)}
              {slider('roll', t('projector.roll', 'Roll°'), -180, 180, 1)}
              {slider('zoom', t('projector.zoom', 'Zoom'), 0.5, 2.5)}
              {slider('lightIntensity', t('projector.light', 'Light'), 0.2, 3.5)}
              {slider('lightAngle', t('projector.lightAngle', 'Light angle°'), 0, 360, 1)}
              {slider('blur', t('projector.blur', 'Camera blur'), 0, 4, 0.1)}
              {slider('noise', t('projector.noise', 'Sensor noise'), 0, 0.5)}
              <Col span={24} md={16}>
                <Typography.Text className="text-body-3-medium">
                  {t('projector.background', 'Background')}
                </Typography.Text>
                <Flex gap={8} align="center" className="mt-1">
                  <Segmented
                    value={settings.background}
                    onChange={(value) => update('background', String(value))}
                    options={BACKGROUND_PRESETS}
                  />
                  <Tooltip title={t('projector.curlDirection', 'Curl direction')}>
                    <Segmented
                      value={settings.curlDirection}
                      onChange={(value) => update('curlDirection', value as 1 | -1)}
                      options={[
                        { value: 1, label: '◠' },
                        { value: -1, label: '◡' },
                      ]}
                    />
                  </Tooltip>
                </Flex>
              </Col>
            </Row>
          </div>
        ) : null}
      </div>
    </Flex>
  );
};

export default Projector;
