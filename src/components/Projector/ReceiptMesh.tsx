import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';

import type { TProjectorSettings } from '@/components/Projector/helpers/settings';

export const PAPER_WORLD_WIDTH = 3;

const SEGMENTS_X = 40;

/**
 * The bill as a subdivided plane:
 *  - curl: rolls the paper lengthwise around a cylinder (receipts curl off the printer roll)
 *  - cup: bows the paper across its width
 *  - wave: soft ripples along its length
 */
const deformPaper = (
  geometry: THREE.PlaneGeometry,
  width: number,
  height: number,
  settings: TProjectorSettings,
) => {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const halfWidth = width / 2;
  const curl = settings.curl;
  const radius = curl > 0.001 ? height / (curl * Math.PI) : Infinity;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    let y = position.getY(i);
    let z = 0;

    if (Number.isFinite(radius)) {
      const theta = y / radius;
      z = radius * (1 - Math.cos(theta)) * settings.curlDirection;
      y = radius * Math.sin(theta);
    }

    z += settings.cup * 0.35 * (x / halfWidth) ** 2;
    z += settings.wave * 0.06 * Math.sin(position.getY(i) * settings.waveFrequency + x * 0.8);

    position.setXYZ(i, x, y, z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
};

export const ReceiptMesh: React.FC<{
  texture: THREE.Texture;
  aspect: number;
  settings: TProjectorSettings;
}> = ({ texture, aspect, settings }) => {
  const width = PAPER_WORLD_WIDTH;
  const height = PAPER_WORLD_WIDTH * aspect;

  const geometry = useMemo(
    () =>
      new THREE.PlaneGeometry(
        width,
        height,
        SEGMENTS_X,
        Math.min(400, Math.round(SEGMENTS_X * aspect)),
      ),
    [width, height, aspect],
  );

  useLayoutEffect(() => {
    // rebuild from a flat plane each time the sliders move
    const flat = new THREE.PlaneGeometry(
      width,
      height,
      SEGMENTS_X,
      Math.min(400, Math.round(SEGMENTS_X * aspect)),
    );
    geometry.setAttribute('position', flat.attributes.position.clone());
    flat.dispose();
    deformPaper(geometry, width, height, settings);
  }, [
    geometry,
    width,
    height,
    aspect,
    settings.curl,
    settings.curlDirection,
    settings.cup,
    settings.wave,
    settings.waveFrequency,
  ]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  const toRad = THREE.MathUtils.degToRad;

  return (
    <mesh
      geometry={geometry}
      rotation={[toRad(settings.tiltX), toRad(settings.tiltY), toRad(settings.roll)]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial map={texture} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
};
