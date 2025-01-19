import { OrbitControls, Sky } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import * as THREE from "three";
import { useRouterContext } from "~/utils/useRouterContext";

function createFireworks({
  scene,
  count,
  scale,
  position,
  texture,
  radius,
}: {
  scene: THREE.Scene;
  count: number;
  scale: number;
  position: THREE.Vector3;
  texture: THREE.Texture;
  radius: number;
}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const lifespan = new Float32Array(count);

  const spherical = new THREE.Spherical();
  const positionVector = new THREE.Vector3();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // create random position in sphere
    spherical.set(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * 2 * Math.PI
    );

    // convert spherical to cartesian coordinates
    positionVector.setFromSpherical(spherical);

    // create random color
    color.setHSL(Math.random(), 1, 0.7);

    // set attributes
    positions.set(positionVector.toArray(), i * 3);
    colors.set(color.toArray(), i * 3);
    scales.set([Math.random()], i);
    lifespan.set([1 + Math.random()], i);
  }
  const fireworksGeometry = new THREE.BufferGeometry();
  fireworksGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  fireworksGeometry.setAttribute(
    "aColor",
    new THREE.BufferAttribute(colors, 3)
  );
  fireworksGeometry.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scales, 1)
  );
  fireworksGeometry.setAttribute(
    "aLifespan",
    new THREE.BufferAttribute(lifespan, 1)
  );
  texture.flipY = false;
  const fireworksMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: scale },
      uResolution: { value: new THREE.Vector2() },
      uTexture: { value: texture },
      uProgress: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const firework = new THREE.Points(fireworksGeometry, fireworksMaterial);
  firework.position.copy(position);
  scene.add(firework);
  return firework;
}

function FireworkGenerator({ counter }: { counter: number }) {
  const { size, scene } = useThree();
  const fireworkTextures = useLoader(THREE.TextureLoader, [
    "/fireworks/1.png",
    "/fireworks/2.png",
    "/fireworks/3.png",
    "/fireworks/4.png",
    "/fireworks/5.png",
    "/fireworks/6.png",
    "/fireworks/7.png",
    "/fireworks/8.png",
  ]);
  const fireworks = useRef<Set<THREE.Points>>(new Set());

  useEffect(() => {
    fireworks.current.add(
      createFireworks({
        scene,
        count: Math.round(Math.max(1000 * Math.random(), 400)),
        scale: Math.max(0.5 * Math.random(), 0.2),
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random(),
          (Math.random() - 0.5) * 2
        ),
        texture:
          fireworkTextures[Math.floor(Math.random() * fireworkTextures.length)],
        radius: Math.random() * 2 + 1,
      })
    );
  }, [scene, fireworkTextures, counter]);

  useFrame((state, delta) => {
    for (const firework of fireworks.current) {
      const material = firework.material as THREE.ShaderMaterial;
      material.uniforms.uResolution.value.set(size.width, size.height);
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      const currentProgress = material.uniforms.uProgress.value;

      // increment progress over 3 seconds
      if (currentProgress < 1) {
        material.uniforms.uProgress.value = Math.min(
          currentProgress + delta / 3,
          1
        );
      }

      if (currentProgress >= 0.99) {
        scene.remove(firework);
        firework.geometry.dispose();
        material.dispose();
        fireworks.current.delete(firework);
      }
    }
  });
  return null;
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [counter, setCounter] = useState(0);
  const { setTheme } = useRouterContext();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="bg-black h-screen w-full">
      <Canvas
        gl={{ antialias: true }}
        dpr={[window.devicePixelRatio, 2]}
        ref={canvasRef}
        onPointerDown={() => {
          setCounter((c) => c + 1);
        }}
      >
        <Suspense fallback={null}>
          <OrbitControls enablePan={false} />
          <Sky
            mieCoefficient={0.005}
            mieDirectionalG={0.7}
            turbidity={10}
            rayleigh={3}
            inclination={2}
          />
          <FireworkGenerator counter={counter} />
        </Suspense>
      </Canvas>
    </div>
  );
}
