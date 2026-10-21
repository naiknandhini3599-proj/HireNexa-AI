import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Avatar3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  audioLevel?: number; // 0 to 1
  avatarMood?: 'neutral' | 'friendly' | 'encouraging' | 'inquiring';
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  isSpeaking,
  isListening,
  isThinking = false,
  audioLevel = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isSpeaking,
    isListening,
    isThinking,
    audioLevel,
  });

  useEffect(() => {
    stateRef.current = { isSpeaking, isListening, isThinking, audioLevel };
  }, [isSpeaking, isListening, isThinking, audioLevel]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for the avatar
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Head / Face Mesh (Stylized holographic android avatar)
    const headGeometry = new THREE.SphereGeometry(0.85, 32, 32);
    headGeometry.scale(0.9, 1.15, 0.95);
    const headMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    avatarGroup.add(head);

    // 2. Futuristic Faceplate / Visor
    const visorGeo = new THREE.SphereGeometry(0.78, 32, 16, 0, Math.PI, 0.6, 1.3);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 0.1, 0.15);
    avatarGroup.add(visor);

    // 3. Eyes (Glowing Neon cyan/blue capsules)
    const eyeGeo = new THREE.CapsuleGeometry(0.08, 0.18, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    
    // Left eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.rotation.z = Math.PI / 2;
    leftEye.position.set(-0.28, 0.16, 0.72);
    avatarGroup.add(leftEye);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.rotation.z = Math.PI / 2;
    rightEye.position.set(0.28, 0.16, 0.72);
    avatarGroup.add(rightEye);

    // 4. Animated Mouth / Dynamic Lip Viseme
    const mouthGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 16);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, -0.28, 0.76);
    avatarGroup.add(mouth);

    // Inner mouth light for speaking luminescence
    const mouthLight = new THREE.PointLight(0x3b82f6, 1, 1.5);
    mouthLight.position.set(0, -0.28, 0.85);
    avatarGroup.add(mouthLight);

    // 5. Headset / Audio Node Ear Cups
    const earGeo = new THREE.TorusGeometry(0.25, 0.08, 16, 32);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.9, 0.05, 0);
    leftEar.rotation.y = Math.PI / 2;
    avatarGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.9, 0.05, 0);
    rightEar.rotation.y = Math.PI / 2;
    avatarGroup.add(rightEar);

    // Headband
    const bandGeo = new THREE.TorusGeometry(0.98, 0.04, 16, 48, Math.PI);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = -Math.PI / 2;
    band.position.set(0, 0.2, 0);
    avatarGroup.add(band);

    // 6. Halo / Neural Activity Ring
    const haloGeo = new THREE.RingGeometry(1.2, 1.25, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2.3;
    halo.position.set(0, 0.8, -0.1);
    avatarGroup.add(halo);

    // 7. Ambient Floating Neural Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3;
      positions[i + 1] = (Math.random() - 0.5) * 3;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5); // Electric cyan key
    dirLight1.position.set(2, 3, 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0); // Purple rim light
    dirLight2.position.set(-2, -1, -2);
    scene.add(dirLight2);

    // Mouse Tracking (Subtle head look toward cursor)
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = Math.max(-0.6, Math.min(0.6, x));
      mouseY = Math.max(-0.4, Math.min(0.4, y));
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation variables
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlink = 3.0;
    let mouthPhonemePhase = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const state = stateRef.current;

      // 1. Natural idle breathing & gentle sway
      avatarGroup.position.y = Math.sin(time * 1.5) * 0.04;
      
      // 2. Smooth head look towards cursor
      avatarGroup.rotation.y += (mouseX * 0.35 - avatarGroup.rotation.y) * 0.08;
      avatarGroup.rotation.x += (-mouseY * 0.25 - avatarGroup.rotation.x) * 0.08;

      // 3. Blinking animation
      blinkTimer += delta;
      if (blinkTimer > nextBlink) {
        leftEye.scale.y = 0.05;
        rightEye.scale.y = 0.05;
        if (blinkTimer > nextBlink + 0.15) {
          leftEye.scale.y = 1;
          rightEye.scale.y = 1;
          blinkTimer = 0;
          nextBlink = 2.5 + Math.random() * 3.5;
        }
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      // 4. Talking & Lip Sync Animation
      if (state.isSpeaking) {
        mouthPhonemePhase += delta * 18;
        const speechWave = Math.abs(Math.sin(mouthPhonemePhase)) * 0.7 + (state.audioLevel || 0.4) * 0.5;
        // Morph mouth shape (vertical opening + horizontal modulation)
        mouth.scale.set(1 + Math.sin(time * 8) * 0.3, 1 + speechWave * 3.2, 1);
        mouthMat.color.setHex(0x38bdf8);
        mouthLight.intensity = 1.5 + speechWave * 1.5;

        // Subtle head nod while making points
        avatarGroup.rotation.x += Math.sin(time * 7) * 0.015;
      } else if (state.isListening) {
        // Listening state: Mouth neutral, eyes attentive
        mouth.scale.set(1, 1, 1);
        mouthMat.color.setHex(0x818cf8);
        mouthLight.intensity = 0.4;
        
        // Attentive slight head tilt
        avatarGroup.rotation.z = Math.sin(time * 0.8) * 0.03;
      } else if (state.isThinking) {
        // Thinking state: eyes glow purple, halo spins faster
        mouth.scale.set(0.9, 0.9, 1);
        mouthMat.color.setHex(0xa855f7);
        eyeMat.color.setHex(0xc084fc);
        halo.rotation.z += delta * 3;
      } else {
        // Idle
        mouth.scale.set(1, 1, 1);
        mouthMat.color.setHex(0x60a5fa);
        eyeMat.color.setHex(0x38bdf8);
        mouthLight.intensity = 0.3;
      }

      // Halo rotation
      halo.rotation.z += delta * 0.5;
      const haloScale = 1 + Math.sin(time * 2) * 0.05;
      halo.scale.set(haloScale, haloScale, 1);

      // Float particles
      particles.rotation.y = time * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      headGeometry.dispose();
      headMaterial.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      eyeGeo.dispose();
      mouthGeo.dispose();
      earGeo.dispose();
      haloGeo.dispose();
      particleGeo.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-72 md:h-84 flex items-center justify-center cursor-grab active:cursor-grabbing"
      />

      {/* Futuristic Status Badge */}
      <div className="absolute bottom-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium glass-panel border border-blue-500/30">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSpeaking
              ? 'bg-emerald-400 animate-ping'
              : isListening
              ? 'bg-blue-400 animate-pulse'
              : isThinking
              ? 'bg-purple-400 animate-pulse'
              : 'bg-slate-400'
          }`}
        />
        <span className="text-slate-200">
          {isSpeaking
            ? 'AI Avatar Speaking'
            : isListening
            ? 'Listening to Candidate...'
            : isThinking
            ? 'Analyzing Response...'
            : 'AI Interviewer Ready'}
        </span>
      </div>
    </div>
  );
};
