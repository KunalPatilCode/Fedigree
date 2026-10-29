"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Creates a high-fidelity multi-stop radial glow particle texture
 * with an intense white hot core and smooth bioluminescent corona.
 */
function createGlowTexture(colorStop: string = "rgba(180, 154, 215, 0.85)"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.95)");
    gradient.addColorStop(0.35, colorStop);
    gradient.addColorStop(0.65, "rgba(128, 100, 169, 0.35)");
    gradient.addColorStop(0.9, "rgba(69, 38, 83, 0.08)");
    gradient.addColorStop(1, "rgba(69, 38, 83, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates an ultra-fine, delicate crystalline star sparkle sprite for active nucleotide loci.
 */
function createSparkleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, 64, 64);

    // Soft subtle radial aura
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 22);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.2, "rgba(254, 243, 199, 0.75)"); // subtle warm champagne
    grad.addColorStop(0.5, "rgba(234, 226, 245, 0.3)");
    grad.addColorStop(1, "rgba(69, 38, 83, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.fill();

    // Fine, tapered needle star rays
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    // Vertical ray
    ctx.beginPath();
    ctx.moveTo(32, 12);
    ctx.lineTo(33, 32);
    ctx.lineTo(32, 52);
    ctx.lineTo(31, 32);
    ctx.closePath();
    ctx.fill();

    // Horizontal ray
    ctx.beginPath();
    ctx.moveTo(12, 32);
    ctx.lineTo(32, 33);
    ctx.lineTo(52, 32);
    ctx.lineTo(32, 31);
    ctx.closePath();
    ctx.fill();
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
    dnaGroup.position.set(3.4, 0.0, 0);
    dnaGroup.rotation.set(-0.2, -0.45, 0.25);
    scene.add(dnaGroup);

    // ─────────────────────────────────────────────────────────────
    // COLOR PALETTE (Fedigree Rich Bioluminescent Tokens)
    // ─────────────────────────────────────────────────────────────
    const colors = {
      plum: new THREE.Color("#452653"),
      deepPurple: new THREE.Color("#573068"),
      purple: new THREE.Color("#8064A9"),
      softLavender: new THREE.Color("#B49AD7"),
      paleLavender: new THREE.Color("#EAE2F5"),
      goldAmber: new THREE.Color("#F59E0B"), // Genetic risk marker highlight
      cyanGlow: new THREE.Color("#38BDF8"),  // Active biomarker pulse
      white: new THREE.Color("#FFFFFF"),
    };

    // ─────────────────────────────────────────────────────────────
    // PARAMETRIC DOUBLE HELIX WITH DYNAMIC ENERGY PULSES
    // ─────────────────────────────────────────────────────────────
    const splinePoints = [
      new THREE.Vector3(1.6, -11.0, -3.5),
      new THREE.Vector3(3.2, -5.5, -1.0),
      new THREE.Vector3(3.0, 0.0, 1.2),
      new THREE.Vector3(1.8, 5.5, 1.8),
      new THREE.Vector3(0.5, 11.0, -0.5),
    ];
    const spineCurve = new THREE.CatmullRomCurve3(splinePoints, false, "centripetal");

    const steps = 120;
    const turns = 3.6;
    const helixRadius = 1.5;
    const subStrandCount = 4;
    const subRadius = 0.24;

    const linePositions: number[] = [];
    const lineColors: number[] = [];

    const particlePositions: number[] = [];
    const particleColors: number[] = [];
    const particleBaseColors: THREE.Color[] = [];
    const particleTValues: number[] = []; // Distance along helix for pulse waves
    const particleSizes: number[] = [];
    const baseParticleSizes: number[] = [];

    const addParticle = (pos: THREE.Vector3, color: THREE.Color, size: number, tVal: number) => {
      particlePositions.push(pos.x, pos.y, pos.z);
      particleColors.push(color.r, color.g, color.b);
      particleBaseColors.push(color.clone());
      particleTValues.push(tVal);
      particleSizes.push(size);
      baseParticleSizes.push(size);
    };

    const addLineSegment = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      c1: THREE.Color,
      c2: THREE.Color
    ) => {
      linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      lineColors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
    };

    interface HelixNode {
      t: number;
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

      let normal = new THREE.Vector3().crossVectors(tangent, upVector).normalize();
      if (normal.lengthSq() < 0.001) normal = new THREE.Vector3(1, 0, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const theta = t * turns * Math.PI * 2;
      const offsetDir = new THREE.Vector3()
        .addScaledVector(normal, Math.cos(theta))
        .addScaledVector(binormal, Math.sin(theta));

      const strandA = center.clone().addScaledVector(offsetDir, helixRadius);
      const strandB = center.clone().addScaledVector(offsetDir, -helixRadius);

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

      nodes.push({ t, center, strandA, strandB, subA, subB });
    }

    // ─────────────────────────────────────────────────────────────
    // ASSEMBLE PARTICLES & LADDER RUNGS
    // ─────────────────────────────────────────────────────────────
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const t = node.t;

      // 1. Primary Strand Backbone Particles
      const isLocus = i % 14 === 0;
      const strandAColor = isLocus ? colors.goldAmber : colors.plum;
      const strandBColor = isLocus ? colors.cyanGlow : colors.deepPurple;
      const strandSize = isLocus ? 6.2 : 4.4;

      addParticle(node.strandA, strandAColor, strandSize, t);
      addParticle(node.strandB, strandBColor, strandSize, t);

      // Periodic crystalline glints
      if (i % 3 === 0) {
        addParticle(node.strandA, colors.white, 3.4, t);
        addParticle(node.strandB, colors.white, 3.4, t);
      }

      // 2. Auxiliary Sub-Strands (forming braided DNA sheath)
      for (let s = 0; s < subStrandCount; s++) {
        const cA = s % 2 === 0 ? colors.purple : colors.softLavender;
        const cB = s % 2 === 0 ? colors.softLavender : colors.purple;
        addParticle(node.subA[s], cA, 2.6, t);
        addParticle(node.subB[s], cB, 2.6, t);

        // Organic micro-dust
        if (i % 2 === 0) {
          const jitter = new THREE.Vector3(
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18
          );
          addParticle(node.subA[s].clone().add(jitter), colors.paleLavender, 1.9, t);
          addParticle(node.subB[s].clone().add(jitter), colors.paleLavender, 1.9, t);
        }
      }

      // 3. Base Pair Hydrogen Bonds (every 2 steps)
      if (i % 2 === 0) {
        addLineSegment(node.strandA, node.strandB, colors.plum, colors.deepPurple);
        addLineSegment(node.subA[0], node.subB[1], colors.softLavender, colors.paleLavender);
        addLineSegment(node.subA[2], node.subB[3], colors.paleLavender, colors.softLavender);

        // Base pair nucleotide dots across rungs
        const rungDots = 5;
        for (let p = 1; p < rungDots; p++) {
          const alpha = p / rungDots;
          const rungPos = new THREE.Vector3().lerpVectors(node.strandA, node.strandB, alpha);
          rungPos.y += Math.sin(alpha * Math.PI) * 0.1;

          const dotColor =
            p % 2 === 0
              ? colors.purple
              : isLocus
              ? colors.goldAmber
              : colors.softLavender;
          addParticle(rungPos, dotColor, 2.4, t);
        }
      }

      // 4. Longitudinal Connectors
      if (i > 0) {
        const prev = nodes[i - 1];
        addLineSegment(prev.strandA, node.strandA, colors.plum, colors.plum);
        addLineSegment(prev.strandB, node.strandB, colors.deepPurple, colors.deepPurple);

        for (let s = 0; s < subStrandCount; s++) {
          addLineSegment(prev.subA[s], node.subA[s], colors.purple, colors.purple);
          addLineSegment(prev.subB[s], node.subB[s], colors.purple, colors.purple);

          const nextS = (s + 1) % subStrandCount;
          addLineSegment(prev.subA[s], node.subA[nextS], colors.softLavender, colors.paleLavender);
          addLineSegment(prev.subB[s], node.subB[nextS], colors.softLavender, colors.paleLavender);

          if (i % 3 === 0) {
            addLineSegment(node.subA[s], node.strandA, colors.softLavender, colors.plum);
            addLineSegment(node.subB[s], node.strandB, colors.softLavender, colors.deepPurple);
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // AMBIENT COSMIC DEPTH CLOUD (FLOATING CHROMOSOMAL PARTICLES)
    // ─────────────────────────────────────────────────────────────
    const ambientCount = 380;
    const ambientPositions = new Float32Array(ambientCount * 3);
    const ambientColors = new Float32Array(ambientCount * 3);
    const ambientSpeeds = new Float32Array(ambientCount);
    const ambientOriginalY = new Float32Array(ambientCount);

    const paletteList = [
      colors.plum,
      colors.purple,
      colors.softLavender,
      colors.paleLavender,
      colors.goldAmber,
      colors.cyanGlow,
      colors.white,
    ];

    for (let a = 0; a < ambientCount; a++) {
      ambientPositions[a * 3] = 1.0 + (Math.random() - 0.4) * 14.0;
      const yVal = (Math.random() - 0.5) * 24.0;
      ambientPositions[a * 3 + 1] = yVal;
      ambientOriginalY[a] = yVal;
      // Strictly positioned in the background behind the DNA double helix
      ambientPositions[a * 3 + 2] = -6.0 - Math.random() * 9.0;

      const pick = paletteList[Math.floor(Math.random() * paletteList.length)];
      ambientColors[a * 3] = pick.r;
      ambientColors[a * 3 + 1] = pick.g;
      ambientColors[a * 3 + 2] = pick.b;

      ambientSpeeds[a] = 0.2 + Math.random() * 0.9;
    }

    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeometry.setAttribute("color", new THREE.BufferAttribute(ambientColors, 3));

    const glowTexture = createGlowTexture();
    const sparkleTexture = createSparkleTexture();

    const ambientMaterial = new THREE.PointsMaterial({
      size: 4.2,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
    ambientPoints.renderOrder = -1; // Guaranteed to render behind DNA strands and particles
    dnaGroup.add(ambientPoints);

    // ─────────────────────────────────────────────────────────────
    // MESH BUFFERS FOR DNA DOUBLE HELIX
    // ─────────────────────────────────────────────────────────────
    // 1. Line segments
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    dnaGroup.add(lineMesh);

    // 2. Glowing DNA Particles
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.Float32BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.4,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    dnaGroup.add(particleMesh);

    // 3. Floating Sparkle Highlights on Key Risk Loci
    const sparklePointsCount = 20;
    const sparklePositions = new Float32Array(sparklePointsCount * 3);
    for (let sp = 0; sp < sparklePointsCount; sp++) {
      const nodeIndex = Math.floor((sp / sparklePointsCount) * (nodes.length - 1));
      const targetStrand = sp % 2 === 0 ? nodes[nodeIndex].strandA : nodes[nodeIndex].strandB;
      sparklePositions[sp * 3] = targetStrand.x;
      sparklePositions[sp * 3 + 1] = targetStrand.y;
      sparklePositions[sp * 3 + 2] = targetStrand.z;
    }
    const sparkleGeometry = new THREE.BufferGeometry();
    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 2.6,
      map: sparkleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color("#FFFBEB"),
    });
    const sparkleMesh = new THREE.Points(sparkleGeometry, sparkleMaterial);
    dnaGroup.add(sparkleMesh);

    // ─────────────────────────────────────────────────────────────
    // INTERACTION & ANIMATION PHYSICS (MOUSE, SCROLL, CLICK PULSE)
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

    // Click impulse shockwave
    let clickEnergy = 0.0;

    const onPointerMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onPointerDown = () => {
      // Trigger sudden bioluminescent excitation ripple
      clickEnergy = 1.0;
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

      if (width < 768) {
        dnaGroup.position.x = 1.2;
        dnaGroup.scale.setScalar(0.75);
      } else if (width < 1200) {
        dnaGroup.position.x = 2.4;
        dnaGroup.scale.setScalar(0.9);
      } else {
        dnaGroup.position.x = 3.4;
        dnaGroup.scale.setScalar(1.05);
      }
    };

    onResize();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    onScroll();

    // ─────────────────────────────────────────────────────────────
    // RENDER LOOP WITH TRAVELING BIOLUMINESCENT WAVE
    // ─────────────────────────────────────────────────────────────
    const startTime = performance.now();
    let animationFrameId: number;

    const baseRotX = -0.2;
    const baseRotY = -0.45;
    const baseRotZ = 0.25;

    const colorAttr = particleGeometry.attributes.color as THREE.BufferAttribute;
    const colorArray = colorAttr.array as Float32Array;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth interpolation for mouse and scroll
      const lerpSpeed = 0.045;
      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpSpeed;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpSpeed;

      const scrollLerp = 0.055;
      scroll.current += (scroll.target - scroll.current) * scrollLerp;

      // Click energy decay
      clickEnergy *= 0.94;

      if (!prefersReducedMotion) {
        // Dynamic continuous rotation + mouse parallax + click kick
        const idleSpin = elapsedTime * 0.14 + clickEnergy * 0.25;
        const scrollTwist = scroll.current * Math.PI * 1.4;

        dnaGroup.rotation.y = baseRotY + idleSpin + mouse.currentX * 0.38 + scrollTwist;
        dnaGroup.rotation.x =
          baseRotX +
          Math.sin(elapsedTime * 0.4) * 0.04 -
          mouse.currentY * 0.28 +
          scroll.current * 0.25;
        dnaGroup.rotation.z =
          baseRotZ +
          Math.cos(elapsedTime * 0.35) * 0.03 +
          mouse.currentX * 0.1;

        // Floating parallax translation
        const baseY = onResizeBaseY(window.innerWidth);
        dnaGroup.position.y =
          baseY +
          Math.sin(elapsedTime * 0.6) * 0.18 -
          mouse.currentY * 0.35 -
          scroll.current * 2.2;

        const baseX = onResizeBaseX(window.innerWidth);
        dnaGroup.position.x = baseX + mouse.currentX * 0.45;

        // ─────────────────────────────────────────────────────────
        // TRAVELING BIOLUMINESCENT PULSE WAVE ALONG DNA SPINAL T
        // ─────────────────────────────────────────────────────────
        const waveSpeed = 0.8;
        const wavePos = (elapsedTime * waveSpeed) % 1.0;
        const waveWidth = 0.14;

        const particleCount = particleTValues.length;
        for (let p = 0; p < particleCount; p++) {
          const tVal = particleTValues[p];
          const distToWave = Math.abs(tVal - wavePos);
          const isNearWave = distToWave < waveWidth || Math.abs(tVal - (wavePos - 1.0)) < waveWidth;

          const baseCol = particleBaseColors[p];
          const idx = p * 3;

          if (isNearWave || clickEnergy > 0.1) {
            // Flash brighter with radiant cyan/white energy
            const waveIntensity = Math.max(
              0,
              1.0 - distToWave / waveWidth
            ) * 0.75 + clickEnergy * 0.8;

            colorArray[idx] = Math.min(1.0, baseCol.r + waveIntensity * 0.6);
            colorArray[idx + 1] = Math.min(1.0, baseCol.g + waveIntensity * 0.7);
            colorArray[idx + 2] = Math.min(1.0, baseCol.b + waveIntensity * 0.9);
          } else {
            // Restore base color
            colorArray[idx] = baseCol.r;
            colorArray[idx + 1] = baseCol.g;
            colorArray[idx + 2] = baseCol.b;
          }
        }
        colorAttr.needsUpdate = true;

        // Modulate delicate sparkle highlights with gentle micro-shimmer
        sparkleMaterial.size = 2.2 + Math.sin(elapsedTime * 3.5) * 0.6 + clickEnergy * 1.4;

        // Drift ambient background particles gently upward
        const posAttr = ambientGeometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        for (let a = 0; a < ambientCount; a++) {
          const idx = a * 3 + 1; // Y axis
          posArray[idx] += 0.005 * ambientSpeeds[a];
          if (posArray[idx] > 12.0) {
            posArray[idx] = -12.0;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    function onResizeBaseX(w: number) {
      if (w < 768) return 1.2;
      if (w < 1200) return 2.4;
      return 3.4;
    }

    function onResizeBaseY(w: number) {
      return w < 768 ? 0.3 : 0.0;
    }

    animate();

    // ─────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      lineGeometry.dispose();
      lineMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ambientGeometry.dispose();
      ambientMaterial.dispose();
      sparkleGeometry.dispose();
      sparkleMaterial.dispose();
      glowTexture.dispose();
      sparkleTexture.dispose();
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
