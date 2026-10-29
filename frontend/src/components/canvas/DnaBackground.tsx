"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Creates an in-memory radial glow circular particle texture
 * avoiding external asset requests and guaranteeing instant rendering.
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.2, "rgba(234, 226, 245, 0.95)"); // #EAE2F5
    gradient.addColorStop(0.45, "rgba(180, 154, 215, 0.75)"); // #B49AD7
    gradient.addColorStop(0.75, "rgba(128, 100, 169, 0.35)"); // #8064A9
    gradient.addColorStop(1, "rgba(69, 38, 83, 0.0)");       // #452653
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function DnaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ─────────────────────────────────────────────────────────────
    // SCENE, CAMERA & RENDERER SETUP
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Completely transparent background
    container.appendChild(renderer.domElement);

    // Root group for all DNA objects
    const dnaGroup = new THREE.Group();
    // Default anchor: positioned comfortably on the right side of the screen
    dnaGroup.position.set(3.4, 0.0, 0);
    dnaGroup.rotation.set(-0.2, -0.45, 0.25);
    scene.add(dnaGroup);

    // ─────────────────────────────────────────────────────────────
    // FEDIGREE THEME COLOR PALETTE
    // ─────────────────────────────────────────────────────────────
    const colors = {
      plum: new THREE.Color("#452653"),       // Deep plum: structural filaments & base pairs
      deepPurple: new THREE.Color("#573068"), // Deep purple
      purple: new THREE.Color("#8064A9"),     // Primary purple: glowing strands
      softLavender: new THREE.Color("#B49AD7"),// Soft lavender: plexus filaments & particles
      paleLavender: new THREE.Color("#EAE2F5"),// Pale lavender: secondary highlights
      white: new THREE.Color("#FFFFFF"),       // Pure white glints
    };

    // ─────────────────────────────────────────────────────────────
    // DNA SPLINE & PARAMETRIC DOUBLE HELIX GENERATION
    // ─────────────────────────────────────────────────────────────
    // Spline curve guiding the DNA across 3D space with natural organic curvature
    const splinePoints = [
      new THREE.Vector3(1.6, -11.0, -3.5),
      new THREE.Vector3(3.2, -5.5, -1.0),
      new THREE.Vector3(3.0, 0.0, 1.2),
      new THREE.Vector3(1.8, 5.5, 1.8),
      new THREE.Vector3(0.5, 11.0, -0.5),
    ];
    const spineCurve = new THREE.CatmullRomCurve3(splinePoints, false, "centripetal");

    const steps = 110;
    const turns = 3.4;
    const helixRadius = 1.45;
    const subStrandCount = 4;
    const subRadius = 0.22;

    // Arrays to store geometry vertices and colors
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    const particlePositions: number[] = [];
    const particleColors: number[] = [];
    const particleSizes: number[] = [];

    // Helper to push a particle
    const addParticle = (pos: THREE.Vector3, color: THREE.Color, size: number) => {
      particlePositions.push(pos.x, pos.y, pos.z);
      particleColors.push(color.r, color.g, color.b);
      particleSizes.push(size);
    };

    // Helper to push a line segment
    const addLineSegment = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      c1: THREE.Color,
      c2: THREE.Color
    ) => {
      linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      lineColors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
    };

    // Pre-calculate strand points along spine curve
    interface HelixNode {
      center: THREE.Vector3;
      strandA: THREE.Vector3;
      strandB: THREE.Vector3;
      subA: THREE.Vector3[];
      subB: THREE.Vector3[];
    }
    const nodes: HelixNode[] = [];

    const upVector = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const center = spineCurve.getPointAt(t);
      const tangent = spineCurve.getTangentAt(t);

      // Compute orthonormal basis (Normal & Binormal)
      let normal = new THREE.Vector3().crossVectors(tangent, upVector).normalize();
      if (normal.lengthSq() < 0.001) normal = new THREE.Vector3(1, 0, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      // Helical angle
      const theta = t * turns * Math.PI * 2;

      // Base vector offset from center
      const offsetDir = new THREE.Vector3()
        .addScaledVector(normal, Math.cos(theta))
        .addScaledVector(binormal, Math.sin(theta));

      const strandA = center.clone().addScaledVector(offsetDir, helixRadius);
      const strandB = center.clone().addScaledVector(offsetDir, -helixRadius);

      // Auxiliary sub-filaments spiraling around Strand A and Strand B
      const subA: THREE.Vector3[] = [];
      const subB: THREE.Vector3[] = [];

      for (let s = 0; s < subStrandCount; s++) {
        const phi = theta * 1.5 + (s * Math.PI * 2) / subStrandCount;
        const subOffset = new THREE.Vector3()
          .addScaledVector(normal, Math.cos(phi))
          .addScaledVector(binormal, Math.sin(phi))
          .multiplyScalar(subRadius * (0.8 + 0.2 * Math.sin(i * 0.35 + s)));

        subA.push(strandA.clone().add(subOffset));
        subB.push(strandB.clone().sub(subOffset));
      }

      nodes.push({ center, strandA, strandB, subA, subB });
    }

    // ─────────────────────────────────────────────────────────────
    // ASSEMBLE PLEXUS MESH, BASE PAIRS & GLOWING PARTICLES
    // ─────────────────────────────────────────────────────────────
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // 1. Primary Strand Particles
      addParticle(node.strandA, colors.plum, 4.0);
      addParticle(node.strandB, colors.deepPurple, 4.0);

      // White sparkle highlights periodically
      if (i % 4 === 0) {
        addParticle(node.strandA, colors.white, 3.2);
        addParticle(node.strandB, colors.white, 3.2);
      }

      // Particles on auxiliary sub-filaments
      for (let s = 0; s < subStrandCount; s++) {
        const cA = s % 2 === 0 ? colors.purple : colors.softLavender;
        const cB = s % 2 === 0 ? colors.softLavender : colors.purple;
        addParticle(node.subA[s], cA, 2.4);
        addParticle(node.subB[s], cB, 2.4);

        // Additional organic micro-dust around strands
        if (i % 2 === 0) {
          const jitter = new THREE.Vector3(
            (Math.random() - 0.5) * 0.16,
            (Math.random() - 0.5) * 0.16,
            (Math.random() - 0.5) * 0.16
          );
          addParticle(node.subA[s].clone().add(jitter), colors.paleLavender, 1.8);
          addParticle(node.subB[s].clone().add(jitter), colors.paleLavender, 1.8);
        }
      }

      // 2. Base Pair Ladder Rungs & Cross-Filaments (every 2-3 steps)
      if (i % 2 === 0) {
        // Direct rung connection between Strand A and Strand B
        addLineSegment(node.strandA, node.strandB, colors.plum, colors.deepPurple);

        // Diagonal web filaments between sub-strands
        addLineSegment(node.subA[0], node.subB[1], colors.softLavender, colors.paleLavender);
        addLineSegment(node.subA[2], node.subB[3], colors.paleLavender, colors.softLavender);

        // 4-6 particles along each base-pair rung
        const rungParticleCount = 5;
        for (let p = 1; p < rungParticleCount; p++) {
          const alpha = p / rungParticleCount;
          const rungPos = new THREE.Vector3().lerpVectors(node.strandA, node.strandB, alpha);
          // slight sinusoidal arch on rungs
          rungPos.y += Math.sin(alpha * Math.PI) * 0.08;

          const rungColor =
            p % 2 === 0 ? colors.purple : p === 1 ? colors.plum : colors.softLavender;
          addParticle(rungPos, rungColor, 2.2);
        }
      }

      // 3. Longitudinal & Plexus Interconnecting Filaments
      if (i > 0) {
        const prev = nodes[i - 1];

        // Main backbone lines
        addLineSegment(prev.strandA, node.strandA, colors.plum, colors.plum);
        addLineSegment(prev.strandB, node.strandB, colors.deepPurple, colors.deepPurple);

        // Longitudinal sub-filaments
        for (let s = 0; s < subStrandCount; s++) {
          addLineSegment(prev.subA[s], node.subA[s], colors.purple, colors.purple);
          addLineSegment(prev.subB[s], node.subB[s], colors.purple, colors.purple);

          // Web cross-connections (forming the organic lattice sheath)
          const nextS = (s + 1) % subStrandCount;
          addLineSegment(prev.subA[s], node.subA[nextS], colors.softLavender, colors.paleLavender);
          addLineSegment(prev.subB[s], node.subB[nextS], colors.softLavender, colors.paleLavender);

          // Connect sub-fiber to main core
          if (i % 3 === 0) {
            addLineSegment(node.subA[s], node.strandA, colors.softLavender, colors.plum);
            addLineSegment(node.subB[s], node.strandB, colors.softLavender, colors.deepPurple);
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // AMBIENT FLOATING GENETIC DUST PARTICLES (DEPTH CLOUD)
    // ─────────────────────────────────────────────────────────────
    const ambientCount = 320;
    const ambientPositions = new Float32Array(ambientCount * 3);
    const ambientColors = new Float32Array(ambientCount * 3);
    const ambientSpeeds = new Float32Array(ambientCount);

    const paletteList = [
      colors.plum,
      colors.purple,
      colors.softLavender,
      colors.paleLavender,
      colors.white,
    ];

    for (let a = 0; a < ambientCount; a++) {
      // Positioned in a generous 3D bounding envelope surrounding the helix
      ambientPositions[a * 3] = 1.0 + (Math.random() - 0.4) * 12.0;
      ambientPositions[a * 3 + 1] = (Math.random() - 0.5) * 22.0;
      ambientPositions[a * 3 + 2] = (Math.random() - 0.5) * 10.0;

      const pick = paletteList[Math.floor(Math.random() * paletteList.length)];
      ambientColors[a * 3] = pick.r;
      ambientColors[a * 3 + 1] = pick.g;
      ambientColors[a * 3 + 2] = pick.b;

      ambientSpeeds[a] = 0.2 + Math.random() * 0.8;
    }

    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(ambientPositions, 3)
    );
    ambientGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(ambientColors, 3)
    );

    const glowTexture = createGlowTexture();

    const ambientMaterial = new THREE.PointsMaterial({
      size: 3.5,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
    dnaGroup.add(ambientPoints);

    // ─────────────────────────────────────────────────────────────
    // BUILD DNA MESH & PARTICLE BUFFERS
    // ─────────────────────────────────────────────────────────────
    // 1. Line Filaments Geometry & Material
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(lineColors, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    dnaGroup.add(lineMesh);

    // 2. DNA Particles Geometry & Material
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 3.8,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    dnaGroup.add(particleMesh);

    // ─────────────────────────────────────────────────────────────
    // INTERACTION & ANIMATION PHYSICS (MOUSE & SCROLL LERP)
    // ─────────────────────────────────────────────────────────────
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const scroll = {
      target: 0,
      current: 0,
    };

    const onPointerMove = (e: MouseEvent) => {
      // Normalize cursor coordinates from -1 to 1
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scroll.target = window.scrollY / maxScroll;
    };

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Responsive placement: shift DNA slightly right on wider viewports
      if (width < 768) {
        dnaGroup.position.x = 1.0;
        dnaGroup.scale.setScalar(0.72);
      } else if (width < 1200) {
        dnaGroup.position.x = 2.4;
        dnaGroup.scale.setScalar(0.88);
      } else {
        dnaGroup.position.x = 3.4;
        dnaGroup.scale.setScalar(1.0);
      }
    };

    // Initialize responsive positioning
    onResize();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Initial scroll sync
    onScroll();

    // ─────────────────────────────────────────────────────────────
    // RENDER LOOP (ORGANIC FLOW + CURSOR EASING + SCROLL PROGRESS)
    // ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const baseRotX = -0.2;
    const baseRotY = -0.45;
    const baseRotZ = 0.25;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for mouse and scroll
      const lerpSpeed = 0.045;
      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpSpeed;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpSpeed;

      const scrollLerp = 0.055;
      scroll.current += (scroll.target - scroll.current) * scrollLerp;

      if (!prefersReducedMotion) {
        // Continuous organic idle rotation + mouse parallax + scroll twist
        const idleSpin = elapsedTime * 0.12;
        const scrollTwist = scroll.current * Math.PI * 1.4;

        dnaGroup.rotation.y =
          baseRotY + idleSpin + mouse.currentX * 0.38 + scrollTwist;
        dnaGroup.rotation.x =
          baseRotX +
          Math.sin(elapsedTime * 0.4) * 0.04 -
          mouse.currentY * 0.28 +
          scroll.current * 0.25;
        dnaGroup.rotation.z =
          baseRotZ +
          Math.cos(elapsedTime * 0.35) * 0.03 +
          mouse.currentX * 0.1;

        // Gentle floating parallax translation + scroll travel
        const baseY = onResizeBaseY(window.innerWidth);
        dnaGroup.position.y =
          baseY +
          Math.sin(elapsedTime * 0.6) * 0.15 -
          mouse.currentY * 0.35 -
          scroll.current * 2.2;

        const baseX = onResizeBaseX(window.innerWidth);
        dnaGroup.position.x = baseX + mouse.currentX * 0.45;

        // Animate ambient drifting particles
        const posAttr = ambientGeometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        for (let a = 0; a < ambientCount; a++) {
          const idx = a * 3 + 1; // Y axis
          posArray[idx] += 0.004 * ambientSpeeds[a];
          // Wrap around if particles drift above bounds
          if (posArray[idx] > 11.0) {
            posArray[idx] = -11.0;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    function onResizeBaseX(w: number) {
      if (w < 768) return 1.0;
      if (w < 1200) return 2.4;
      return 3.4;
    }

    function onResizeBaseY(w: number) {
      return w < 768 ? 0.3 : 0.0;
    }

    animate();

    // ─────────────────────────────────────────────────────────────
    // CLEANUP ON UNMOUNT
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      lineGeometry.dispose();
      lineMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ambientGeometry.dispose();
      ambientMaterial.dispose();
      glowTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

