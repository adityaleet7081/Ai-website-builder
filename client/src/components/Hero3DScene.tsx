import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Hero3DSceneProps {
  mousePos: { x: number; y: number };
}

export default function Hero3DScene({ mousePos }: Hero3DSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef(mousePos);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // === SETUP ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // === MAIN TORUS KNOT (Wireframe + Solid) ===
    const knotGeometry = new THREE.TorusKnotGeometry(1.6, 0.5, 200, 32, 2, 3);

    // Glowing wireframe
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x7c3aed),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframeKnot = new THREE.Mesh(knotGeometry, wireframeMat);
    scene.add(wireframeKnot);

    // Inner glow solid
    const solidMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x7c3aed),
      transparent: true,
      opacity: 0.04,
    });
    const solidKnot = new THREE.Mesh(knotGeometry, solidMat);
    scene.add(solidKnot);

    // === OUTER RING ===
    const ringGeo = new THREE.TorusGeometry(3, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x06b6d4),
      transparent: true,
      opacity: 0.25,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.5;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.01, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.15 })
    );
    ring2.rotation.x = Math.PI / 1.8;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // === PARTICLE FIELD ===
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const violet = new THREE.Color(0x7c3aed);
    const cyan = new THREE.Color(0x06b6d4);
    const pink = new THREE.Color(0xec4899);
    const palette = [violet, cyan, pink];

    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // === FLOATING LIGHT ORBS ===
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const orbGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.8,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: 2.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.3,
        yOffset: (Math.random() - 0.5) * 2,
      };
      scene.add(orb);
      orbs.push(orb);
    }

    // === ANIMATION ===
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const mp = mousePosRef.current;

      // Rotate torus knot
      wireframeKnot.rotation.x = elapsed * 0.15 + mp.y * 0.3;
      wireframeKnot.rotation.y = elapsed * 0.2 + mp.x * 0.3;
      solidKnot.rotation.copy(wireframeKnot.rotation);

      // Pulse wireframe opacity
      wireframeMat.opacity = 0.2 + Math.sin(elapsed * 0.8) * 0.1;

      // Rotate rings
      ring1.rotation.z = elapsed * 0.1;
      ring2.rotation.z = -elapsed * 0.08;

      // Rotate particle field slowly
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      // Animate orbs
      orbs.forEach((orb) => {
        const d = orb.userData;
        d.angle += d.speed * 0.01;
        orb.position.x = Math.cos(d.angle) * d.radius;
        orb.position.z = Math.sin(d.angle) * d.radius;
        orb.position.y = d.yOffset + Math.sin(elapsed * d.speed + d.angle) * 0.5;
      });

      // Camera follow mouse subtly
      camera.position.x += (mp.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (mp.y * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // === RESIZE ===
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
