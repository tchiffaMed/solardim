'use client';

import { useEffect, useRef, useState } from 'react';
import { Sun, RotateCcw, Play, Pause } from 'lucide-react';

interface SolarScene3DProps {
  inclinaison: number;       // Inclinaison en degrés (0-45)
  orientation: 'Plein Sud' | 'Sud-Est' | 'Sud-Ouest';
  latitude: number;          // Latitude du site
  npTotal: number;           // Nombre total de panneaux
  nps: number;               // Panneaux en série
  nbrp: number;              // Strings en parallèle
  irrDefavorable: number;    // Irradiation mois défavorable
}

export default function SolarScene3D({
  inclinaison,
  orientation,
  latitude,
  npTotal,
  nps,
  nbrp,
  irrDefavorable,
}: SolarScene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const panelGroupRef = useRef<any>(null);
  const sunRef = useRef<any>(null);
  const sunLightRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sunAngle, setSunAngle] = useState(45);
  const [error, setError] = useState<string | null>(null);

  const orientationAngle = orientation === 'Sud-Est' ? -30 : orientation === 'Sud-Ouest' ? 30 : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let THREE: any;
    let destroyed = false;

    import('three').then((module) => {
      if (destroyed) return;
      THREE = module;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f4f8);
      scene.fog = new THREE.FogExp2(0xe8edf2, 0.018);
      sceneRef.current = scene;

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
      camera.position.set(14, 10, 18);
      camera.lookAt(0, 2, 0);
      cameraRef.current = camera;

      // ── Lights ──
      const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.5);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff5c0, 2.5);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 100;
      sunLight.shadow.camera.left = -25;
      sunLight.shadow.camera.right = 25;
      sunLight.shadow.camera.top = 25;
      sunLight.shadow.camera.bottom = -25;
      sunLight.shadow.bias = -0.001;
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      const fillLight = new THREE.DirectionalLight(0xb0c8e0, 0.4);
      fillLight.position.set(-5, 3, -5);
      scene.add(fillLight);

      // ── Sol / Terrain ──
      const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0xd4b896 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grille sol
      const gridHelper = new THREE.GridHelper(50, 25, 0xc4a882, 0xd4b896);
      (gridHelper.material as any).opacity = 0.3;
      (gridHelper.material as any).transparent = true;
      scene.add(gridHelper);

      // ── Bâtiment de fond ──
      const buildingGeo = new THREE.BoxGeometry(8, 3.5, 5);
      const buildingMat = new THREE.MeshLambertMaterial({ color: 0xe8d5b7 });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(-8, 1.75, -6);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);

      // Toit du bâtiment
      const roofGeo = new THREE.ConeGeometry(5.5, 1.5, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0xc47a3a });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(-8, 4.25, -6);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);

      // ── Arbres déco ──
      const treePositions = [[-15, 0, -10], [15, 0, -12], [-12, 0, 8], [16, 0, 6]];
      treePositions.forEach(([x, , z]) => {
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leafGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const leafMat = new THREE.MeshLambertMaterial({ color: 0x3a7a2a });
        const leaves = new THREE.Mesh(leafGeo, leafMat);
        leaves.position.set(x, 3.2, z);
        leaves.castShadow = true;
        scene.add(leaves);
      });

      // ── Groupe panneaux ──
      const panelGroup = new THREE.Group();
      panelGroupRef.current = panelGroup;

      // Calcul de la grille de panneaux à afficher (max 20 pour perf)
      const displayNp = Math.min(npTotal, 20);
      const cols = Math.min(nps, 5);
      const rows = Math.ceil(displayNp / cols);
      const panelW = 1.6, panelH = 1.0, gap = 0.12;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (row * cols + col >= displayNp) break;

          const support = new THREE.Group();

          // Structure métallique support
          const legGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.8, 5);
          const legMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
          [-0.5, 0.5].forEach(lx => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(lx * panelW * 0.7, 0.4, 0);
            leg.castShadow = true;
            support.add(leg);
          });

          // Corps du panneau
          const panelFrameGeo = new THREE.BoxGeometry(panelW, 0.04, panelH);
          const frameMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
          const frame = new THREE.Mesh(panelFrameGeo, frameMat);
          frame.castShadow = true;
          frame.receiveShadow = true;
          support.add(frame);

          // Cellules PV (grille visuelle)
          const cellGeo = new THREE.BoxGeometry(panelW - 0.1, 0.02, panelH - 0.1);
          const cellMat = new THREE.MeshPhongMaterial({
            color: 0x1a2a5e,
            specular: 0x334477,
            shininess: 80,
          });
          const cells = new THREE.Mesh(cellGeo, cellMat);
          cells.position.y = 0.03;
          support.add(cells);

          // Lignes de cellules (détail visuel)
          const lineMat = new THREE.LineBasicMaterial({ color: 0x263870, linewidth: 1 });
          const lineCount = 6;
          for (let i = 1; i < lineCount; i++) {
            const z = -panelH / 2 + (panelH / lineCount) * i;
            const pts = [
              new THREE.Vector3(-panelW / 2 + 0.05, 0.04, z),
              new THREE.Vector3(panelW / 2 - 0.05, 0.04, z),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const line = new THREE.Line(geo, lineMat);
            support.add(line);
          }

          // Position dans la grille
          support.position.set(
            (col - (cols - 1) / 2) * (panelW + gap),
            0.8,
            (row - (rows - 1) / 2) * (panelH + gap)
          );

          panelGroup.add(support);
        }
      }

      // Position du groupe panneaux
      panelGroup.position.set(2, 0, 0);

      // Application inclinaison (rotation autour de X) et orientation (rotation Y)
      panelGroup.rotation.y = (orientationAngle * Math.PI) / 180;
      // L'inclinaison s'applique via un parent group
      const tiltGroup = new THREE.Group();
      tiltGroup.add(panelGroup);
      tiltGroup.rotation.x = -(inclinaison * Math.PI) / 180;
      scene.add(tiltGroup);

      // ── Soleil ──
      const sunGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sun);
      sunRef.current = sun;

      // Halo solaire
      const haloGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xFFEB80,
        transparent: true,
        opacity: 0.2,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      sun.add(halo);

      // ── Câbles ──
      const cableMat = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
      const cablePts = [
        new THREE.Vector3(2, 0.5, 0),
        new THREE.Vector3(5, 0.3, 0),
        new THREE.Vector3(6, 0, 0),
      ];
      const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePts);
      const cable = new THREE.Line(cableGeo, cableMat);
      scene.add(cable);

      // Boîtier régulateur
      const boxGeo = new THREE.BoxGeometry(0.6, 0.9, 0.4);
      const boxMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(6.5, 0.45, 0);
      box.castShadow = true;
      scene.add(box);

      // LED verte sur le boîtier
      const ledGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(6.5, 0.8, 0.21);
      scene.add(led);

      setIsLoaded(true);

      // ── Animation ──
      function animate() {
        animFrameRef.current = requestAnimationFrame(animate);

        if (isAnimating) {
          timeRef.current += 0.003;
        }

        const t = timeRef.current;

        // Arc solaire (simuler la course du soleil selon latitude)
        const maxElev = (90 - Math.abs(latitude) + 23.5) * (Math.PI / 180);
        const sunRadius = 28;
        const sunX = Math.cos(t) * sunRadius;
        const sunY = Math.max(0.5, Math.sin(t) * sunRadius * Math.sin(maxElev) + 2);
        const sunZ = Math.sin(t) * sunRadius * Math.cos(maxElev) - 15;

        if (sunRef.current) {
          sunRef.current.position.set(sunX, sunY, sunZ);
          sunRef.current.visible = sunY > 0.5;
        }

        if (sunLightRef.current) {
          sunLightRef.current.position.set(sunX * 0.5, sunY, sunZ * 0.5);
          // Intensité selon hauteur du soleil
          const normalized = Math.max(0, sunY / (sunRadius * 0.7));
          sunLightRef.current.intensity = normalized * 3;
          const warmth = 1 - normalized * 0.3;
          sunLightRef.current.color.setRGB(1, warmth * 0.95, warmth * 0.7);
        }

        // Mise à jour angle affiché
        const angleDeg = Math.round((Math.asin(Math.max(-1, Math.min(1, sunY / sunRadius))) * 180) / Math.PI);
        setSunAngle(Math.max(0, angleDeg));

        // Légère rotation caméra
        const camAngle = t * 0.05;
        camera.position.x = Math.cos(camAngle) * 22;
        camera.position.z = Math.sin(camAngle) * 22;
        camera.position.y = 10 + Math.sin(t * 0.1) * 1;
        camera.lookAt(0, 2, 0);

        renderer.render(scene, camera);
      }

      animate();

      // Resize
      const handleResize = () => {
        if (!canvas || !renderer || !camera) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }).catch(err => {
      console.error('Three.js load error:', err);
      setError('Impossible de charger la scène 3D.');
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  // Mettre à jour inclinaison en temps réel
  useEffect(() => {
    if (!panelGroupRef.current) return;
    // Le parent tiltGroup gère l'inclinaison
    const tiltGroup = panelGroupRef.current.parent;
    if (tiltGroup) {
      tiltGroup.rotation.x = -(inclinaison * Math.PI) / 180;
    }
    panelGroupRef.current.rotation.y = (orientationAngle * Math.PI) / 180;
  }, [inclinaison, orientationAngle]);

  const toggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(14, 10, 18);
      cameraRef.current.lookAt(0, 2, 0);
    }
    timeRef.current = 0;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-earth-200 bg-gradient-to-b from-sky-100 to-earth-100"
      style={{ height: '380px' }}>

      {/* Canvas 3D */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Loading */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-50/80">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-solar-300 border-t-solar-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-earth-500">Chargement de la scène 3D…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-earth-50">
          <p className="text-sm text-earth-400">{error}</p>
        </div>
      )}

      {/* Overlay infos */}
      {isLoaded && (
        <>
          {/* Top-left : infos */}
          <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-semibold text-earth-700">
              <span className="w-2 h-2 rounded-full bg-solar-400 inline-block" />
              Simulation 3D — Installation PV
            </div>
            <div className="text-earth-500">Inclinaison : <strong className="text-solar-600">{inclinaison}°</strong></div>
            <div className="text-earth-500">Orientation : <strong className="text-earth-700">{orientation}</strong></div>
            <div className="text-earth-500">Panneaux affichés : <strong>{Math.min(npTotal, 20)}/{npTotal}</strong></div>
          </div>

          {/* Top-right : soleil */}
          <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-solar-600 font-semibold mb-1">
              <Sun className="w-3 h-3" />
              Arc solaire
            </div>
            <div className="text-earth-500">Élévation : <strong className="text-solar-600">{sunAngle}°</strong></div>
            <div className="text-earth-500">Latitude : <strong>{latitude.toFixed(1)}°N</strong></div>
            <div className="text-earth-500">Irr. déf. : <strong className="text-red-500">{irrDefavorable} kWh/m²/j</strong></div>
          </div>

          {/* Bottom : contrôles */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              onClick={toggleAnimation}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white border border-earth-200 rounded-lg px-3 py-1.5 text-xs font-medium text-earth-700 shadow-sm transition-all"
            >
              {isAnimating
                ? <><Pause className="w-3 h-3" /> Pause</>
                : <><Play className="w-3 h-3" /> Animer</>
              }
            </button>
            <button
              onClick={resetCamera}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white border border-earth-200 rounded-lg px-3 py-1.5 text-xs font-medium text-earth-700 shadow-sm transition-all"
            >
              <RotateCcw className="w-3 h-3" /> Reset vue
            </button>
          </div>
        </>
      )}
    </div>
  );
}
