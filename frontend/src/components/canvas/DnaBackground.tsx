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

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 22);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.2, "rgba(254, 243, 199, 0.75)");
    grad.addColorStop(0.5, "rgba(234, 226, 245, 0.3)");
    grad.addColorStop(1, "rgba(69, 38, 83, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(32, 12); ctx.lineTo(33, 32); ctx.lineTo(32, 52); ctx.lineTo(31, 32);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, 32); ctx.lineTo(32, 33); ctx.lineTo(52, 32); ctx.lineTo(32, 31);
    ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Responsive layout: 4 breakpoints that match what looks correct on each device ──
// On desktop (≥1024px) the left sidebar is 256px, so DNA must be pushed right enough
// to sit in the content area's right half without overlapping hero text.
function getLayout(width: number): { posX: number; posY: number; scale: number } {
  if (width < 480)  return { posX: 0.6,  posY: 0.5, scale: 0.65 }; // small phones
  if (width < 768)  return { posX: 1.2,  posY: 0.4, scale: 0.75 }; // phones
  if (width < 1024) return { posX: 2.2,  posY: 0.0, scale: 0.88 }; // tablets (no sidebar)
  if (width < 1440) return { posX: 3.2,  posY: 0.0, scale: 0.95 }; // laptops (256px sidebar)
  return                    { posX: 3.6,  posY: 0.0, scale: 1.05 }; // large desktops
}

export function DnaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ─────────────────────────────────────────────────────────────
    // SCENE, CAMERA & RENDERER
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
    // Cap DPR at 2 for performance — sizeAttenuation:true handles visual consistency
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    dnaGroup.rotation.set(-0.2, -0.45, 0.25);
    scene.add(dnaGroup);

    // Apply initial layout
    const initLayout = getLayout(window.innerWidth);
    dnaGroup.position.set(initLayout.posX, initLayout.posY, 0);
    dnaGroup.scale.setScalar(initLayout.scale);

    // ─────────────────────────────────────────────────────────────
    // COLOR PALETTE
    // ─────────────────────────────────────────────────────────────
    const colors = {
      plum:         new THREE.Color("#452653"),
      deepPurple:   new THREE.Color("#573068"),
      purple:       new THREE.Color("#8064A9"),
      softLavender: new THREE.Color("#B49AD7"),
      paleLavender: new THREE.Color("#EAE2F5"),
      goldAmber:    new THREE.Color("#F59E0B"),
      cyanGlow:     new THREE.Color("#38BDF8"),
      white:        new THREE.Color("#FFFFFF"),
    };

    // ─────────────────────────────────────────────────────────────
    // PARAMETRIC DOUBLE HELIX
    // ─────────────────────────────────────────────────────────────
    const splinePoints = [
      new THREE.Vector3(1.6, -11.0, -3.5),
      new THREE.Vector3(3.2,  -5.5, -1.0),
      new THREE.Vector3(3.0,   0.0,  1.2),
      new THREE.Vector3(1.8,   5.5,  1.8),
      new THREE.Vector3(0.5,  11.0, -0.5),
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
    const particleTValues: number[] = [];

    const addParticle = (pos: THREE.Vector3, color: THREE.Color, tVal: number) => {
      particlePositions.push(pos.x, pos.y, pos.z);
      particleColors.push(color.r, color.g, color.b);
      particleBaseColors.push(color.clone());
      particleTValues.push(tVal);
    };

    const addLine = (p1: THREE.Vector3, p2: THREE.Vector3, c1: THREE.Color, c2: THREE.Color) => {
      linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      lineColors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
    };

    interface HelixNode {
      t: number; center: THREE.Vector3;
      strandA: THREE.Vector3; strandB: THREE.Vector3;
      subA: THREE.Vector3[];  subB: THREE.Vector3[];
    }
    const nodes: HelixNode[] = [];
    const upVector = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const center  = spineCurve.getPointAt(t);
      const tangent = spineCurve.getTangentAt(t);

      let normal = new THREE.Vector3().crossVectors(tangent, upVector).normalize();
      if (normal.lengthSq() < 0.001) normal = new THREE.Vector3(1, 0, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const theta     = t * turns * Math.PI * 2;
      const offsetDir = new THREE.Vector3()
        .addScaledVector(normal,   Math.cos(theta))
        .addScaledVector(binormal, Math.sin(theta));

      const strandA = center.clone().addScaledVector(offsetDir,  helixRadius);
      const strandB = center.clone().addScaledVector(offsetDir, -helixRadius);

      const subA: THREE.Vector3[] = [];
      const subB: THREE.Vector3[] = [];
      for (let s = 0; s < subStrandCount; s++) {
        const phi = theta * 1.5 + (s * Math.PI * 2) / subStrandCount;
        const sub = new THREE.Vector3()
          .addScaledVector(normal,   Math.cos(phi))
          .addScaledVector(binormal, Math.sin(phi))
          .multiplyScalar(subRadius * (0.8 + 0.2 * Math.sin(i * 0.35 + s)));
        subA.push(strandA.clone().add(sub));
        subB.push(strandB.clone().sub(sub));
      }
      nodes.push({ t, center, strandA, strandB, subA, subB });
    }

    for (let i = 0; i < nodes.length; i++) {
      const node    = nodes[i];
      const { t }   = node;
      const isLocus = i % 14 === 0;

      addParticle(node.strandA, isLocus ? colors.goldAmber  : colors.plum,       t);
      addParticle(node.strandB, isLocus ? colors.cyanGlow   : colors.deepPurple, t);

      if (i % 3 === 0) {
        addParticle(node.strandA, colors.white, t);
        addParticle(node.strandB, colors.white, t);
      }

      for (let s = 0; s < subStrandCount; s++) {
        addParticle(node.subA[s], s % 2 === 0 ? colors.purple : colors.softLavender, t);
        addParticle(node.subB[s], s % 2 === 0 ? colors.softLavender : colors.purple, t);
        if (i % 2 === 0) {
          const j = new THREE.Vector3((Math.random()-0.5)*0.18, (Math.random()-0.5)*0.18, (Math.random()-0.5)*0.18);
          addParticle(node.subA[s].clone().add(j), colors.paleLavender, t);
          addParticle(node.subB[s].clone().add(j), colors.paleLavender, t);
        }
      }

      if (i % 2 === 0) {
        addLine(node.strandA, node.strandB, colors.plum, colors.deepPurple);
        addLine(node.subA[0], node.subB[1], colors.softLavender, colors.paleLavender);
        addLine(node.subA[2], node.subB[3], colors.paleLavender, colors.softLavender);
        for (let p = 1; p < 5; p++) {
          const alpha  = p / 5;
          const rungPos = new THREE.Vector3().lerpVectors(node.strandA, node.strandB, alpha);
          rungPos.y += Math.sin(alpha * Math.PI) * 0.1;
          addParticle(rungPos, p % 2 === 0 ? colors.purple : isLocus ? colors.goldAmber : colors.softLavender, t);
        }
      }

      if (i > 0) {
        const prev = nodes[i - 1];
        addLine(prev.strandA, node.strandA, colors.plum, colors.plum);
        addLine(prev.strandB, node.strandB, colors.deepPurple, colors.deepPurple);
        for (let s = 0; s < subStrandCount; s++) {
          addLine(prev.subA[s], node.subA[s], colors.purple, colors.purple);
          addLine(prev.subB[s], node.subB[s], colors.purple, colors.purple);
          const ns = (s + 1) % subStrandCount;
          addLine(prev.subA[s], node.subA[ns], colors.softLavender, colors.paleLavender);
          addLine(prev.subB[s], node.subB[ns], colors.softLavender, colors.paleLavender);
          if (i % 3 === 0) {
            addLine(node.subA[s], node.strandA, colors.softLavender, colors.plum);
            addLine(node.subB[s], node.strandB, colors.softLavender, colors.deepPurple);
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // AMBIENT CLOUD — kept tightly near the DNA group centre so
    // it never drifts over the hero text on the left.
    // x is clamped to [0, 8] in local space (right side only).
    // ─────────────────────────────────────────────────────────────
    const ambientCount = 280;
    const ambientPositions = new Float32Array(ambientCount * 3);
    const ambientColors    = new Float32Array(ambientCount * 3);
    const ambientSpeeds    = new Float32Array(ambientCount);

    const palette = [
      colors.plum, colors.purple, colors.softLavender,
      colors.paleLavender, colors.goldAmber, colors.cyanGlow, colors.white,
    ];

    for (let a = 0; a < ambientCount; a++) {
      // x: 0 → +8 only (right half of local space, won't bleed left)
      ambientPositions[a * 3]     = Math.random() * 8.0;
      ambientPositions[a * 3 + 1] = (Math.random() - 0.5) * 22.0;
      ambientPositions[a * 3 + 2] = -6.0 - Math.random() * 9.0; // behind helix
      const pick = palette[Math.floor(Math.random() * palette.length)];
      ambientColors[a * 3]     = pick.r;
      ambientColors[a * 3 + 1] = pick.g;
      ambientColors[a * 3 + 2] = pick.b;
      ambientSpeeds[a] = 0.2 + Math.random() * 0.9;
    }

    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeometry.setAttribute("color",    new THREE.BufferAttribute(ambientColors,    3));

    const glowTexture    = createGlowTexture();
    const sparkleTexture = createSparkleTexture();

    const ambientMaterial = new THREE.PointsMaterial({
      size: 3.8,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,           // subtler — background only
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
    ambientPoints.renderOrder = -1;
    dnaGroup.add(ambientPoints);

    // ─────────────────────────────────────────────────────────────
    // DNA LINE MESH
    // ─────────────────────────────────────────────────────────────
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color",    new THREE.Float32BufferAttribute(lineColors,    3));
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.72,
      blending: THREE.NormalBlending, depthWrite: false,
    });
    dnaGroup.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    // ─────────────────────────────────────────────────────────────
    // DNA PARTICLE MESH
    // ─────────────────────────────────────────────────────────────
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color",    new THREE.Float32BufferAttribute(particleColors,    3));
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

    // ─────────────────────────────────────────────────────────────
    // SPARKLE HIGHLIGHTS
    // ─────────────────────────────────────────────────────────────
    const sparkleCount = 20;
    const sparklePos   = new Float32Array(sparkleCount * 3);
    for (let sp = 0; sp < sparkleCount; sp++) {
      const ni  = Math.floor((sp / sparkleCount) * (nodes.length - 1));
      const src = sp % 2 === 0 ? nodes[ni].strandA : nodes[ni].strandB;
      sparklePos[sp * 3] = src.x; sparklePos[sp * 3 + 1] = src.y; sparklePos[sp * 3 + 2] = src.z;
    }
    const sparkleGeometry = new THREE.BufferGeometry();
    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
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
    // INTERACTION STATE
    // ─────────────────────────────────────────────────────────────
    const mouse  = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
    const scroll = { target: 0, current: 0 };
    let clickEnergy = 0.0;

    const onPointerMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth)  *  2 - 1;
      mouse.targetY = (e.clientY / window.innerHeight) * -2 + 1;
    };
    const onPointerDown = () => { clickEnergy = 1.0; };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.target = window.scrollY / max;
    };
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      const lay = getLayout(w);
      dnaGroup.position.x = lay.posX;
      dnaGroup.position.y = lay.posY;
      dnaGroup.scale.setScalar(lay.scale);
    };

    onResize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll",      onScroll,      { passive: true });
    window.addEventListener("resize",      onResize,      { passive: true });
    onScroll();

    // ─────────────────────────────────────────────────────────────
    // RENDER LOOP — fully delta-time based (frame-rate independent)
    // ─────────────────────────────────────────────────────────────
    const baseRotX = -0.2, baseRotY = -0.45, baseRotZ = 0.25;
    const colorAttr  = particleGeometry.attributes.color as THREE.BufferAttribute;
    const colorArray = colorAttr.array as Float32Array;

    let lastTime    = performance.now();
    let elapsedTime = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now   = performance.now();
      const delta = Math.min((now - lastTime) * 0.001, 0.05); // cap at 50 ms
      lastTime     = now;
      elapsedTime += delta;

      // Exponential lerp — identical feel at any frame rate
      const mLerp = 1 - Math.pow(0.05, delta);
      const sLerp = 1 - Math.pow(0.04, delta);
      mouse.currentX  += (mouse.targetX  - mouse.currentX)  * mLerp;
      mouse.currentY  += (mouse.targetY  - mouse.currentY)  * mLerp;
      scroll.current  += (scroll.target  - scroll.current)  * sLerp;
      clickEnergy     *= Math.pow(0.94, delta * 60);

      if (!prefersReducedMotion) {
        const lay        = getLayout(window.innerWidth);
        const idleSpin   = elapsedTime * 0.14 + clickEnergy * 0.25;
        const scrollTwist = scroll.current * Math.PI * 1.4;

        dnaGroup.rotation.y = baseRotY + idleSpin + mouse.currentX * 0.38 + scrollTwist;
        dnaGroup.rotation.x = baseRotX + Math.sin(elapsedTime * 0.4) * 0.04 - mouse.currentY * 0.28 + scroll.current * 0.25;
        dnaGroup.rotation.z = baseRotZ + Math.cos(elapsedTime * 0.35) * 0.03 + mouse.currentX * 0.1;

        dnaGroup.position.x = lay.posX + mouse.currentX * 0.45;
        dnaGroup.position.y = lay.posY + Math.sin(elapsedTime * 0.6) * 0.18 - mouse.currentY * 0.35 - scroll.current * 2.2;

        // Bioluminescent pulse wave
        const wavePos   = (elapsedTime * 0.8) % 1.0;
        const waveWidth = 0.14;
        const pCount    = particleTValues.length;
        for (let p = 0; p < pCount; p++) {
          const tVal      = particleTValues[p];
          const dist      = Math.abs(tVal - wavePos);
          const near      = dist < waveWidth || Math.abs(tVal - (wavePos - 1.0)) < waveWidth;
          const base      = particleBaseColors[p];
          const idx       = p * 3;
          if (near || clickEnergy > 0.1) {
            const wi = Math.max(0, 1.0 - dist / waveWidth) * 0.75 + clickEnergy * 0.8;
            colorArray[idx]     = Math.min(1, base.r + wi * 0.6);
            colorArray[idx + 1] = Math.min(1, base.g + wi * 0.7);
            colorArray[idx + 2] = Math.min(1, base.b + wi * 0.9);
          } else {
            colorArray[idx] = base.r; colorArray[idx+1] = base.g; colorArray[idx+2] = base.b;
          }
        }
        colorAttr.needsUpdate = true;

        sparkleMaterial.size = 2.2 + Math.sin(elapsedTime * 3.5) * 0.6 + clickEnergy * 1.4;

        // Drift ambient cloud upward
        const posAttr  = ambientGeometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        for (let a = 0; a < ambientCount; a++) {
          posArray[a * 3 + 1] += delta * 0.3 * ambientSpeeds[a];
          if (posArray[a * 3 + 1] > 11.0) posArray[a * 3 + 1] = -11.0;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll",      onScroll);
      window.removeEventListener("resize",      onResize);

      lineGeometry.dispose();     lineMaterial.dispose();
      particleGeometry.dispose(); particleMaterial.dispose();
      ambientGeometry.dispose();  ambientMaterial.dispose();
      sparkleGeometry.dispose();  sparkleMaterial.dispose();
      glowTexture.dispose();      sparkleTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
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
