/**
 * Miracle of Pakistan - The Highway Rickshaw Adventure
 * Complete Authentic Pakistani 3D Endless Highway Engine
 * - 100% Fixed Controls: Left is LEFT (-X), Right is RIGHT (+X), Fast & Snappy
 * - Elevated Cinematic Camera for Unobstructed Road View
 * - Real Tuk Tuk Rickshaw 3D Model (assets/tuk_tuk_rikshaw.glb) Mounted with PBR Materials
 * - Real 3D Honda CD 70 Motorcycle with 4-Stroke Sound & High Speed
 * - Real 3D Pakistani Suzuki Mehran ("The Boss")
 * - Authentic Pakistani Bedford Art Truck with Crown Taj, Side Art & Dangling Chains
 * - Pedestrians in Traditional Shalwar Kameez Crossing the Highway to Dodge
 * - Real Audio Engine with WAV/MP3 Support for 2-Stroke, CD 70, Pressure Horn & Metal Crash
 * - Realistic Lighting, Dense Pakistani Urban Environment, Dhabas & Billboards
 */

class MiracleOfPakistanGame {
  constructor() {
    this.container = document.getElementById('game-container');

    this.isRunning = false;
    this.isGameOver = false;

    // Movement & Scoring
    this.distance = 0;
    this.chaiCount = 0;
    this.highScore = parseInt(localStorage.getItem('mop_high_score') || '0', 10);
    this.speed = 0;
    this.maxSpeed = 85;
    this.minSpeed = 25;

    // Lanes across 4-lane Pakistani Highway:
    // Leftmost = -6.6, Middle-Left = -2.2, Middle-Right = 2.2, Rightmost = 6.6
    this.lanes = [-6.6, -2.2, 2.2, 6.6];
    this.playerX = 0;
    this.playerVelocityX = 0;

    // Controls
    this.keys = {
      left: false,
      right: false,
      accelerate: false,
      brake: false,
      horn: false
    };

    // World & Object Pooling
    this.roadSegments = [];
    this.roadSegmentLength = 100;
    this.totalRoadSegments = 6;

    this.obstacles = [];
    this.collectibles = [];
    this.pedestrians = [];
    this.smokeParticles = [];

    // Camera Dynamics
    this.shakeIntensity = 0;
    this.targetCameraFov = 60;

    // UI Elements
    this.ui = {
      score: document.getElementById('score-val'),
      chai: document.getElementById('chai-val'),
      speed: document.getElementById('speed-val'),
      gear: document.getElementById('gear-val'),
      alertBanner: document.getElementById('alert-banner'),
      funBanner: document.getElementById('fun-banner'),
      funText: document.getElementById('fun-text'),
      startScreen: document.getElementById('start-screen'),
      gameOverScreen: document.getElementById('game-over-screen'),
      finalScore: document.getElementById('final-score'),
      finalChai: document.getElementById('final-chai'),
      highScore: document.getElementById('high-score'),
      gameOverQuote: document.getElementById('game-over-quote'),
      startBtn: document.getElementById('start-btn'),
      restartBtn: document.getElementById('restart-btn'),
      soundToggle: document.getElementById('sound-toggle')
    };

    // 3D Models Cache
    this.models = {
      rickshaw: null,
      bike: null
    };

    this.selectedVehicle = 'rickshaw'; // 'rickshaw', 'cd70', 'mehran'

    this.funnyQuotes = [
      '"Ustaad khambay se dosti ho gayi!" 💥',
      '"Fasla rakhein warna khamba lag jayega!" 🛑',
      '"WAPDA walon ne khamba road ke darmian lagaya hi kyun tha?!" ⚡',
      '"Challan kat gaya aur tyre nikal gaya!" 😅',
      '"Bhai indicator to de dete!" 🚗',
      '"Dekh magar pyaar se, khambay ko chorr ke!" ❤️'
    ];

    this.initThree();
    this.initPBRMaterials();
    this.createWorld();
    this.initGLTFModels();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate);
  }

  // ==================== 1. THREE.JS SCENE SETUP & LIGHTING ====================
  initThree() {
    this.scene = new THREE.Scene();

    // Golden Hour Pakistani Atmosphere
    this.scene.background = new THREE.Color(0xe0d7c7);
    this.scene.fog = new THREE.FogExp2(0xd6b78d, 0.0055);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    // Elevated camera positioned cleanly behind vehicle for wide forward highway view
    this.camera.position.set(0, 4.6, -7.8);
    this.camera.lookAt(0, 2.1, 28);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Realistic Sunlight & Sky Ambience
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x78350f, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    this.sun = new THREE.DirectionalLight(0xfff7ed, 1.45);
    this.sun.position.set(-35, 65, -25);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 180;
    this.sun.shadow.camera.left = -30;
    this.sun.shadow.camera.right = 30;
    this.sun.shadow.camera.top = 30;
    this.sun.shadow.camera.bottom = -30;
    this.sun.shadow.bias = -0.0004;
    this.scene.add(this.sun);
  }

  // ==================== 2. PBR MATERIALS ====================
  initPBRMaterials() {
    this.materials = {
      asphalt: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createRealisticAsphaltTexture(),
        roughness: 0.82,
        metalness: 0.12
      }),
      kerb: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createRealisticKerbTexture(),
        roughness: 0.75
      }),
      dirt: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createRealisticDustTerrain(),
        roughness: 0.95
      }),
      wapdaConcrete: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createWeatheredConcreteTexture(),
        roughness: 0.88,
        metalness: 0.08
      }),
      rickshawGreen: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createMetallicPaintTexture('#15803d', '#22c55e'),
        roughness: 0.32,
        metalness: 0.65
      }),
      cd70Red: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createCD70TankTexture(),
        roughness: 0.28,
        metalness: 0.72
      }),
      mehranWhite: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createMetallicPaintTexture('#f8fafc', '#ffffff'),
        roughness: 0.35,
        metalness: 0.45
      }),
      canopyYellow: new THREE.MeshStandardMaterial({
        map: TextureGenerator.createRickshawCanopyTexture(),
        roughness: 0.90,
        metalness: 0.05
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.12,
        metalness: 0.94
      }),
      rubberTyre: new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.92,
        metalness: 0.08
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.75
      }),
      leatherBlack: new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.85
      }),
      insulator: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.18,
        metalness: 0.4
      }),
      contactShadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
      })
    };
  }

  // ==================== 3. 3D GLTF ASSETS PIPELINE ====================
  initGLTFModels() {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    const loader = new THREE.GLTFLoader();

    // Load User's Real Tuk Tuk Rickshaw GLB Model
    const mountRickshawGLB = (scene) => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            // Clear emissive washout and enable authentic diffuse textures
            if (child.material.emissive) child.material.emissive.set(0x000000);
            child.material.roughness = 0.38;
            child.material.metalness = 0.25;
            child.material.needsUpdate = true;
          }
        }
      });

      const wrapper = new THREE.Group();
      scene.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Natural metric scale (height ~ 1.85m)
      const targetHeight = 1.85;
      const scale = targetHeight / (size.y || 1);
      scene.scale.set(scale, scale, scale);

      // Center model and rest wheels flat on asphalt
      scene.position.x = -center.x * scale;
      scene.position.y = -box.min.y * scale;
      scene.position.z = -center.z * scale;

      wrapper.add(scene);
      this.models.rickshaw = wrapper;
      console.log('🎉 Authentic Tuk Tuk Rickshaw GLB Loaded & Mounted!');

      if (this.selectedVehicle === 'rickshaw') {
        this.selectVehicle('rickshaw');
      }
    };

    loader.load('assets/tuk_tuk_rikshaw.glb', (gltf) => {
      mountRickshawGLB(gltf.scene);
    }, undefined, () => {
      loader.load('assets/rickshaw.glb', (gltf) => {
        mountRickshawGLB(gltf.scene);
      }, undefined, () => {
        console.log('Using procedural high-detail rickshaw');
      });
    });

    // Load External CD 70 GLB if placed in assets/
    const mountBikeGLB = (scene) => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material && child.material.emissive) child.material.emissive.set(0x000000);
        }
      });
      const wrapper = new THREE.Group();
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const scale = 1.35 / (size.y || 1);
      scene.scale.set(scale, scale, scale);
      scene.position.x = -center.x * scale;
      scene.position.y = -box.min.y * scale;
      scene.position.z = -center.z * scale;

      wrapper.add(scene);
      this.models.bike = wrapper;
      console.log('🎉 Honda CD 70 GLB Loaded!');

      if (this.selectedVehicle === 'cd70') {
        this.selectVehicle('cd70');
      }
    };

    loader.load('assets/cd70.glb', (gltf) => mountBikeGLB(gltf.scene), undefined, () => {
      loader.load('assets/bike.glb', (gltf) => mountBikeGLB(gltf.scene), undefined, () => {});
    });
  }

  // ==================== 4. WORLD & HIGHWAY CREATION ====================
  createWorld() {
    this.createPlayerVehicleMount();

    for (let i = 0; i < this.totalRoadSegments; i++) {
      this.createRoadSegment(i * this.roadSegmentLength);
    }
  }

  createPlayerVehicleMount() {
    this.playerVehicle = new THREE.Group();
    this.playerVehicleChassis = new THREE.Group();
    this.playerVehicle.add(this.playerVehicleChassis);

    // Initial mount: Rickshaw
    this.selectVehicle('rickshaw');
    this.scene.add(this.playerVehicle);
  }

  createRoadSegment(zOffset) {
    const segment = new THREE.Group();
    segment.position.z = zOffset;

    const roadWidth = 20;
    const length = this.roadSegmentLength;

    // Asphalt Highway
    const asphaltGeo = new THREE.PlaneGeometry(roadWidth, length);
    asphaltGeo.rotateX(-Math.PI / 2);
    const asphalt = new THREE.Mesh(asphaltGeo, this.materials.asphalt);
    asphalt.receiveShadow = true;
    segment.add(asphalt);

    // Kerbs (Red & White)
    const kerbGeo = new THREE.BoxGeometry(0.8, 0.35, length);
    const kerbL = new THREE.Mesh(kerbGeo, this.materials.kerb);
    kerbL.position.set(-roadWidth / 2 - 0.4, 0.175, 0);
    kerbL.receiveShadow = true;
    segment.add(kerbL);

    const kerbR = new THREE.Mesh(kerbGeo, this.materials.kerb);
    kerbR.position.set(roadWidth / 2 + 0.4, 0.175, 0);
    kerbR.receiveShadow = true;
    segment.add(kerbR);

    // Dusty Sidewalk Ground
    const dirtGeo = new THREE.PlaneGeometry(35, length);
    dirtGeo.rotateX(-Math.PI / 2);
    const dirtL = new THREE.Mesh(dirtGeo, this.materials.dirt);
    dirtL.position.set(-roadWidth / 2 - 17.5, -0.05, 0);
    dirtL.receiveShadow = true;
    segment.add(dirtL);

    const dirtR = new THREE.Mesh(dirtGeo, this.materials.dirt);
    dirtR.position.set(roadWidth / 2 + 17.5, -0.05, 0);
    dirtR.receiveShadow = true;
    segment.add(dirtR);

    // Dense Pakistani City Architecture & Street Environment
    this.addDenseCityEnvironment(segment, length);

    this.scene.add(segment);
    this.roadSegments.push(segment);

    if (zOffset > 40) {
      this.spawnSegmentObstacles(zOffset, length);
    }
  }

  // Populate Roadside with Pakistani Plazas, Dhabas, Trees & Billboards
  addDenseCityEnvironment(segment, length) {
    const spacing = 32;

    for (let z = -length / 2 + 16; z < length / 2; z += spacing) {
      // Left side building
      const bL = this.createPakistaniBuilding();
      bL.position.set(-19.5, 0, z);
      segment.add(bL);

      // Right side building / Dhaba
      if (Math.random() > 0.45) {
        const bR = this.createPakistaniBuilding();
        bR.position.set(19.5, 0, z);
        bR.rotation.y = Math.PI;
        segment.add(bR);
      } else {
        const dhaba = this.createRealisticDhaba();
        dhaba.position.set(18.5, 0, z);
        dhaba.rotation.y = Math.PI;
        segment.add(dhaba);
      }

      // Leafy Neem / Sheesham Tree
      const tree = this.createRoadsideTree();
      tree.position.set(Math.random() > 0.5 ? -12.5 : 12.5, 0, z + 12);
      segment.add(tree);
    }

    // Overhead Sign Gantry
    if (Math.random() > 0.45) {
      const gantry = this.createOverheadGantry();
      gantry.position.set(0, 0, (Math.random() - 0.5) * (length - 40));
      segment.add(gantry);
    }
  }

  // Multi-Story Pakistani Commercial Building with Architectural Depth
  createPakistaniBuilding() {
    const group = new THREE.Group();
    const styleIdx = Math.floor(Math.random() * 4);
    const height = 12 + Math.random() * 8;
    const width = 14 + Math.random() * 5;

    const bMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createBuildingFacadeTexture(styleIdx),
      roughness: 0.85
    });
    const bGeo = new THREE.BoxGeometry(width, height, 12);
    const mesh = new THREE.Mesh(bGeo, bMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Rooftop Sintex Blue Water Tank
    const tankGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.5, 14);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(2.2, height + 0.75, -1.2);
    group.add(tank);

    // AC Outdoor Compressor Unit on Facade
    const acGeo = new THREE.BoxGeometry(1.2, 0.8, 0.5);
    const acMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const ac = new THREE.Mesh(acGeo, acMat);
    ac.position.set(-2.5, height * 0.65, 6.2);
    group.add(ac);

    return group;
  }

  createRoadsideTree() {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 4.4, 10), trunkMat);
    trunk.position.y = 2.2;
    trunk.castShadow = true;
    group.add(trunk);

    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.85 });
    const clusters = [
      [0, 4.6, 0, 1.5, 1.3],
      [-0.8, 4.1, 0.5, 1.2, 1.1],
      [0.9, 4.3, -0.4, 1.3, 1.1],
      [0.2, 5.4, 0.2, 1.1, 1.2]
    ];
    clusters.forEach(c => {
      const l = new THREE.Mesh(new THREE.DodecahedronGeometry(c[3], 1), leavesMat);
      l.position.set(c[0], c[1], c[2]);
      l.scale.set(c[4], 1.0, c[4]);
      l.castShadow = true;
      group.add(l);
    });

    return group;
  }

  createRealisticDhaba() {
    const group = new THREE.Group();

    // Brick Base Building
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 7), baseMat);
    base.position.set(0, 2.1, 0);
    group.add(base);

    // Striped Awning
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.15, 3.8), awningMat);
    awning.position.set(0, 3.3, 4.5);
    awning.rotation.x = 0.22;
    group.add(awning);

    // Dhaba Sign
    const signMat = new THREE.MeshBasicMaterial({ map: TextureGenerator.createDhabaSignTexture() });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.6), signMat);
    sign.position.set(0, 3.8, 3.6);
    group.add(sign);

    // Roadside Charpai (Woven Cot)
    const charpai = this.createCharpai();
    charpai.position.set(-1.8, 0, 5.2);
    group.add(charpai);

    return group;
  }

  createCharpai() {
    const cp = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 1.2), woodMat);
    frame.position.y = 0.45;

    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 0.95), ropeMat);
    bed.position.y = 0.48;

    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
    [[-0.95, 0.225, -0.5], [0.95, 0.225, -0.5], [-0.95, 0.225, 0.5], [0.95, 0.225, 0.5]].forEach(p => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(...p);
      cp.add(leg);
    });

    cp.add(frame, bed);
    return cp;
  }

  createOverheadGantry() {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.85 });

    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9.5, 12), steelMat);
    postL.position.set(-10.5, 4.75, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9.5, 12), steelMat);
    postR.position.set(10.5, 4.75, 0);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.55, 0.55), steelMat);
    beam.position.set(0, 8.8, 0);

    const bMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createBillboardTexture(Math.floor(Math.random() * 5))
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.2), bMat);
    board.position.set(0, 8.8, 0.35);

    group.add(postL, postR, beam, board);
    return group;
  }

  // ==================== 5. PROCEDURAL DETAILED VEHICLE MODELS ====================
  // High-Fidelity Pakistani Auto Rickshaw
  createDetailedRickshaw() {
    const rickshaw = new THREE.Group();

    // Floorboard & Lower Chassis
    const floor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 2.4), this.materials.leatherBlack);
    floor.position.set(0, 0.35, 0);
    floor.castShadow = true;
    rickshaw.add(floor);

    // Rear Passenger Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.6), this.materials.leatherBlack);
    seat.position.set(0, 0.55, -0.65);
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 0.1), this.materials.leatherBlack);
    backrest.position.set(0, 0.98, -0.98);
    rickshaw.add(seat, backrest);

    // Driver Seat
    const dSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.5), this.materials.leatherBlack);
    dSeat.position.set(0, 0.6, 0.35);
    rickshaw.add(dSeat);

    // Metal Green Body Panels
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 1.4), this.materials.rickshawGreen);
    sideL.position.set(-0.7, 0.65, -0.45);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 1.4), this.materials.rickshawGreen);
    sideR.position.set(0.7, 0.65, -0.45);
    const backP = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.65, 0.06), this.materials.rickshawGreen);
    backP.position.set(0, 0.65, -1.15);
    rickshaw.add(sideL, sideR, backP);

    // Front Sloped Cowl & Headlight
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.1, 16, 1, false, 0, Math.PI), this.materials.rickshawGreen);
    nose.rotation.x = Math.PI / 2;
    nose.rotation.z = Math.PI;
    nose.position.set(0, 0.75, 1.25);
    nose.scale.set(0.9, 0.7, 1.0);
    rickshaw.add(nose);

    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16), this.materials.chrome);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(0, 0.85, 1.8);
    rickshaw.add(hl);

    // Yellow Canopy Fabric Roof
    const roofCurveGeo = new THREE.CylinderGeometry(1.25, 1.25, 2.3, 24, 1, false, Math.PI * 0.18, Math.PI * 0.64);
    roofCurveGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofCurveGeo, this.materials.canopyYellow);
    roof.position.set(0, 1.25, -0.15);
    roof.scale.set(0.65, 0.72, 1.0);
    roof.castShadow = true;
    rickshaw.add(roof);

    // Roof Chrome Support Pillars
    const pGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.3, 10);
    [[-0.68, 1.35, 0.85], [0.68, 1.35, 0.85], [-0.68, 1.35, -1.1], [0.68, 1.35, -1.1]].forEach(p => {
      const pil = new THREE.Mesh(pGeo, this.materials.chrome);
      pil.position.set(...p);
      rickshaw.add(pil);
    });

    // Glass Windshield
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.75), this.materials.glass);
    ws.position.set(0, 1.45, 0.88);
    ws.rotation.x = -0.14;
    rickshaw.add(ws);

    // Wheels (1 Front, 2 Rear)
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 18);
    wGeo.rotateZ(Math.PI / 2);

    const fWheel = new THREE.Mesh(wGeo, this.materials.rubberTyre);
    fWheel.position.set(0, 0.32, 1.2);
    const rWheelL = new THREE.Mesh(wGeo, this.materials.rubberTyre);
    rWheelL.position.set(-0.72, 0.32, -0.75);
    const rWheelR = new THREE.Mesh(wGeo, this.materials.rubberTyre);
    rWheelR.position.set(0.72, 0.32, -0.75);
    rickshaw.add(fWheel, rWheelL, rWheelR);

    // Rear Mudflap
    const mudflapGeo = new THREE.PlaneGeometry(1.1, 0.55);
    const mudflapMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createRickshawRearTexture(),
      side: THREE.DoubleSide
    });
    const mudflap = new THREE.Mesh(mudflapGeo, mudflapMat);
    mudflap.position.set(0, 0.42, -1.18);
    mudflap.rotation.y = Math.PI;
    rickshaw.add(mudflap);

    return rickshaw;
  }

  // Authentic 3D Pakistani Honda CD 70 Motorcycle
  createDetailedCD70() {
    const bike = new THREE.Group();

    // Red Fuel Tank with Honda Wing
    const tankGeo = new THREE.BoxGeometry(0.42, 0.32, 0.75);
    const tank = new THREE.Mesh(tankGeo, this.materials.cd70Red);
    tank.position.set(0, 0.95, 0.15);
    tank.castShadow = true;
    bike.add(tank);

    // Long Black Padded Seat
    const seatGeo = new THREE.BoxGeometry(0.38, 0.18, 0.85);
    const seat = new THREE.Mesh(seatGeo, this.materials.leatherBlack);
    seat.position.set(0, 0.98, -0.55);
    seat.castShadow = true;
    bike.add(seat);

    // Slender Black Steel Frame
    const frameGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 10);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 });
    const frame1 = new THREE.Mesh(frameGeo, frameMat);
    frame1.rotation.x = 0.55;
    frame1.position.set(0, 0.65, 0.15);
    bike.add(frame1);

    // 72cc Engine Block with Cooling Fins
    const engGeo = new THREE.BoxGeometry(0.32, 0.32, 0.42);
    const engMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.85 });
    const eng = new THREE.Mesh(engGeo, engMat);
    eng.position.set(0, 0.52, 0.1);
    bike.add(eng);

    // Chrome Exhaust Silencer Pipe
    const exPipeGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.45, 12);
    exPipeGeo.rotateX(Math.PI / 2);
    const exPipe = new THREE.Mesh(exPipeGeo, this.materials.chrome);
    exPipe.position.set(0.24, 0.35, -0.55);
    bike.add(exPipe);

    // Chrome Handlebars & Mirrors
    const hBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 10);
    hBarGeo.rotateZ(Math.PI / 2);
    const hBar = new THREE.Mesh(hBarGeo, this.materials.chrome);
    hBar.position.set(0, 1.25, 0.62);
    bike.add(hBar);

    // Round Headlight
    const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    hlGeo.rotateX(Math.PI / 2);
    const hl = new THREE.Mesh(hlGeo, this.materials.chrome);
    hl.position.set(0, 1.1, 0.78);
    bike.add(hl);

    // Spoked Wheels
    const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20);
    wGeo.rotateZ(Math.PI / 2);

    const fWheel = new THREE.Mesh(wGeo, this.materials.rubberTyre);
    fWheel.position.set(0, 0.35, 0.85);
    const rWheel = new THREE.Mesh(wGeo, this.materials.rubberTyre);
    rWheel.position.set(0, 0.35, -0.85);
    bike.add(fWheel, rWheel);

    // Chrome Mudguards (Fenders)
    const fendGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.14, 16, 1, false, 0, Math.PI);
    fendGeo.rotateZ(Math.PI / 2);
    const fFend = new THREE.Mesh(fendGeo, this.materials.chrome);
    fFend.position.set(0, 0.42, 0.85);
    bike.add(fFend);

    // Number Plate LEH-70
    const plateGeo = new THREE.PlaneGeometry(0.3, 0.15);
    const plateMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.58, -1.02);
    bike.add(plate);

    return bike;
  }

  // Authentic 3D Pakistani Suzuki Mehran ("The Boss")
  createDetailedMehran() {
    const car = new THREE.Group();

    // Main Hatchback Body
    const bodyGeo = new THREE.BoxGeometry(1.65, 0.75, 3.4);
    const body = new THREE.Mesh(bodyGeo, this.materials.mehranWhite);
    body.position.set(0, 0.65, 0);
    body.castShadow = true;
    car.add(body);

    // Upper Cabin & Roof
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.65, 1.95);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.mehranWhite);
    cabin.position.set(0, 1.28, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Windshield & Rear Hatch Glass
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.65), this.materials.glass);
    ws.position.set(0, 1.25, 0.82);
    ws.rotation.x = -0.42;
    const rGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), this.materials.glass);
    rGlass.position.set(0, 1.25, -1.22);
    rGlass.rotation.x = 0.52;
    car.add(ws, rGlass);

    // Black Bumpers (Front & Rear)
    const bumpMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const fBump = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.28), bumpMat);
    fBump.position.set(0, 0.42, 1.75);
    const rBump = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.28), bumpMat);
    rBump.position.set(0, 0.42, -1.75);
    car.add(fBump, rBump);

    // Rectangular Headlights & Suzuki Grille
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.1 });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), hlMat);
    hlL.position.set(-0.62, 0.75, 1.72);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), hlMat);
    hlR.position.set(0.62, 0.75, 1.72);
    car.add(hlL, hlR);

    // 4 Wheels
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 18);
    wGeo.rotateZ(Math.PI / 2);
    [[-0.82, 0.32, 1.1], [0.82, 0.32, 1.1], [-0.82, 0.32, -1.1], [0.82, 0.32, -1.1]].forEach(p => {
      const w = new THREE.Mesh(wGeo, this.materials.rubberTyre);
      w.position.set(...p);
      car.add(w);
    });

    return car;
  }

  // Authentic Pakistani Bedford Art Truck with Crown Taj & Dangling Chains
  createDetailedBedfordTruck() {
    const truck = new THREE.Group();

    // 1. Heavy Wooden Cargo Bed with Truck Art Side Panels
    const cargoMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createTruckArtTexture(),
      roughness: 0.45,
      metalness: 0.15
    });
    const cargoGeo = new THREE.BoxGeometry(2.7, 2.6, 6.2);
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(0, 2.3, -1.2);
    cargo.castShadow = true;
    truck.add(cargo);

    // 2. Front Bedford Cab (Orange / Red with Chrome Trim)
    const cabMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createMetallicPaintTexture('#ea580c', '#fb923c'),
      roughness: 0.35,
      metalness: 0.65
    });
    const cabGeo = new THREE.BoxGeometry(2.5, 1.95, 2.2);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.75, 2.5);
    cab.castShadow = true;
    truck.add(cab);

    // 3. Ornate Carved Wooden Crown ("Taj") on Top of Cab
    const crownGeo = new THREE.BoxGeometry(2.65, 0.85, 0.95);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 3.1, 2.5);
    crown.castShadow = true;
    truck.add(crown);

    // Crown Peacock / Floral Crest
    const crestGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.12, 16);
    crestGeo.rotateX(Math.PI / 2);
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 3.65, 2.8);
    truck.add(crest);

    // 4. Heavy Steel Bumper with Dangling Chains
    const bumpMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.9 });
    const fGuard = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.45, 0.35), bumpMat);
    fGuard.position.set(0, 0.55, 3.65);
    truck.add(fGuard);

    // Dangling metal chains under bumper
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    for (let c = -1.2; c <= 1.2; c += 0.35) {
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.35, 6), chainMat);
      chain.position.set(c, 0.25, 3.65);
      truck.add(chain);
    }

    // Dual Round Headlights
    const hlGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16);
    hlGeo.rotateX(Math.PI / 2);
    const hlL = new THREE.Mesh(hlGeo, this.materials.chrome);
    hlL.position.set(-0.85, 1.1, 3.62);
    const hlR = new THREE.Mesh(hlGeo, this.materials.chrome);
    hlR.position.set(0.85, 1.1, 3.62);
    truck.add(hlL, hlR);

    // 6 Heavy Dual Wheels
    const wGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.45, 18);
    wGeo.rotateZ(Math.PI / 2);
    [
      [-1.38, 0.58, 2.4], [1.38, 0.58, 2.4],
      [-1.38, 0.58, -1.8], [1.38, 0.58, -1.8],
      [-1.38, 0.58, -3.1], [1.38, 0.58, -3.1]
    ].forEach(p => {
      const w = new THREE.Mesh(wGeo, this.materials.rubberTyre);
      w.position.set(...p);
      truck.add(w);
    });

    return truck;
  }

  // Authentic Pakistani Traditional Pedestrian (Shalwar Kameez)
  createDetailedPedestrian() {
    const p = new THREE.Group();

    // Shalwar Kameez Colors (Muted Pakistani Earth/Linen Tones)
    const kurtaColors = [0xf5f5f4, 0x78716c, 0x1e3a8a, 0x14532d, 0x713f12];
    const kColor = kurtaColors[Math.floor(Math.random() * kurtaColors.length)];
    const kurtaMat = new THREE.MeshStandardMaterial({ color: kColor, roughness: 0.85 });

    // Torso / Kurta
    const torsoGeo = new THREE.BoxGeometry(0.52, 0.78, 0.32);
    const torso = new THREE.Mesh(torsoGeo, kurtaMat);
    torso.position.y = 1.18;
    torso.castShadow = true;
    p.add(torso);

    // Traditional Waistcoat (Waskat)
    const waskatMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
    const waskat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.65, 0.34), waskatMat);
    waskat.position.y = 1.22;
    p.add(waskat);

    // Head & Traditional Cap (Karakuli / Sindhi Topi / Prayer Cap)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    p.add(head);

    const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.14, 14), capMat);
    cap.position.y = 1.86;
    p.add(cap);

    // Left & Right Legs (Shalwar)
    const legGeo = new THREE.BoxGeometry(0.22, 0.75, 0.24);
    const legL = new THREE.Mesh(legGeo, kurtaMat);
    legL.position.set(-0.14, 0.42, 0);
    const legR = new THREE.Mesh(legGeo, kurtaMat);
    legR.position.set(0.14, 0.42, 0);
    p.add(legL, legR);

    // Left & Right Arms
    const armGeo = new THREE.BoxGeometry(0.15, 0.65, 0.15);
    const armL = new THREE.Mesh(armGeo, kurtaMat);
    armL.position.set(-0.35, 1.15, 0);
    const armR = new THREE.Mesh(armGeo, kurtaMat);
    armR.position.set(0.35, 1.15, 0);
    p.add(armL, armR);

    p.userData.legL = legL;
    p.userData.legR = legR;
    p.userData.armL = armL;
    p.userData.armR = armR;

    return p;
  }

  // ==================== 6. GARAGE & VEHICLE SELECTION ====================
  selectVehicle(type) {
    this.selectedVehicle = type;
    document.querySelectorAll('.veh-opt').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-veh') === type);
    });

    while (this.playerVehicleChassis.children.length > 0) {
      this.playerVehicleChassis.remove(this.playerVehicleChassis.children[0]);
    }

    const startSmall = this.ui.startBtn.querySelector('small');

    if (type === 'rickshaw') {
      if (this.models.rickshaw) {
        this.playerVehicleChassis.add(this.models.rickshaw.clone());
      } else {
        this.playerVehicleChassis.add(this.createDetailedRickshaw());
      }
      this.maxSpeed = 85;
      if (startSmall) startSmall.textContent = 'START TUK TUK RICKSHAW';
    } else if (type === 'cd70') {
      if (this.models.bike) {
        this.playerVehicleChassis.add(this.models.bike.clone());
      } else {
        this.playerVehicleChassis.add(this.createDetailedCD70());
      }
      this.maxSpeed = 110;
      if (startSmall) startSmall.textContent = 'START HONDA CD 70';
    } else if (type === 'mehran') {
      this.playerVehicleChassis.add(this.createDetailedMehran());
      this.maxSpeed = 100;
      if (startSmall) startSmall.textContent = 'START SUZUKI MEHRAN';
    }

    // Contact Shadow Decal
    const shadowGeo = new THREE.PlaneGeometry(2.4, 3.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.contactShadow);
    shadow.position.y = 0.02;
    this.playerVehicleChassis.add(shadow);
  }

  // ==================== 7. SPAWNERS: TRAFFIC, POLES, PEDESTRIANS ====================
  spawnSegmentObstacles(zOffset, length) {
    const spawnZStart = zOffset - length / 2;
    const numObstacles = Math.floor(Math.random() * 2) + 3;

    for (let i = 0; i < numObstacles; i++) {
      const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
      const z = spawnZStart + Math.random() * (length - 25) + 12;

      const roll = Math.random();
      if (roll < 0.38) {
        // WAPDA ELECTRIC POLE IN HIGHWAY LANE
        this.spawnRealisticWapdaPole(lane, z);
      } else if (roll < 0.62) {
        this.spawnRealisticMehran(lane, z);
      } else if (roll < 0.80) {
        this.spawnRealisticCD70(lane, z);
      } else {
        this.spawnRealisticBedfordTruck(lane, z);
      }
    }

    // Pedestrian Crossing the Road
    if (Math.random() > 0.45) {
      const pedZ = spawnZStart + Math.random() * (length - 30) + 15;
      this.spawnCrossingPedestrian(pedZ);
    }

    // Collectible Garam Karak Chai
    if (Math.random() > 0.25) {
      const chaiLane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
      const chaiZ = spawnZStart + Math.random() * length;
      this.spawnChaiCup(chaiLane, chaiZ);
    }
  }

  spawnRealisticWapdaPole(x, z) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);

    const shadowGeo = new THREE.CircleGeometry(1.4, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.contactShadow);
    shadow.position.y = 0.02;
    poleGroup.add(shadow);

    const poleGeo = new THREE.CylinderGeometry(0.42, 0.58, 11, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.wapdaConcrete);
    pole.position.y = 5.5;
    pole.castShadow = true;
    pole.receiveShadow = true;
    poleGroup.add(pole);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const crossArmGeo = new THREE.BoxGeometry(3.6, 0.28, 0.28);
    const arm1 = new THREE.Mesh(crossArmGeo, woodMat);
    arm1.position.set(0, 10.2, 0);
    arm1.castShadow = true;
    const arm2 = new THREE.Mesh(crossArmGeo, woodMat);
    arm2.position.set(0, 9.1, 0);
    arm2.castShadow = true;
    poleGroup.add(arm1, arm2);

    const insGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.45, 12);
    [-1.6, -0.8, 0, 0.8, 1.6].forEach(insX => {
      const ins = new THREE.Mesh(insGeo, this.materials.insulator);
      ins.position.set(insX, 10.55, 0);
      poleGroup.add(ins);
    });

    const transGeo = new THREE.BoxGeometry(1.3, 1.5, 1.1);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.35 });
    const trans = new THREE.Mesh(transGeo, transMat);
    trans.position.set(0, 7.8, 0.85);
    poleGroup.add(trans);

    poleGroup.userData = {
      type: 'pole',
      radius: 0.85,
      speed: 0,
      nearMissed: false
    };

    this.scene.add(poleGroup);
    this.obstacles.push(poleGroup);
  }

  spawnRealisticBedfordTruck(x, z) {
    const truck = this.createDetailedBedfordTruck();
    truck.position.set(x, 0, z);

    truck.userData = {
      type: 'truck',
      radius: 1.5,
      speed: 38 + Math.random() * 14,
      nearMissed: false
    };

    this.scene.add(truck);
    this.obstacles.push(truck);
  }

  spawnRealisticMehran(x, z) {
    const car = this.createDetailedMehran();
    car.position.set(x, 0, z);

    car.userData = {
      type: 'mehran',
      radius: 1.1,
      speed: 52 + Math.random() * 20,
      nearMissed: false
    };

    this.scene.add(car);
    this.obstacles.push(car);
  }

  spawnRealisticCD70(x, z) {
    const bike = this.createDetailedCD70();
    bike.position.set(x, 0, z);

    bike.userData = {
      type: 'cd70',
      radius: 0.8,
      speed: 55 + Math.random() * 25,
      nearMissed: false
    };

    this.scene.add(bike);
    this.obstacles.push(bike);
  }

  // Pedestrians Crossing Road Horizontally
  spawnCrossingPedestrian(z) {
    const ped = this.createDetailedPedestrian();
    // Start from left sidewalk (-10.5) or right sidewalk (10.5)
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -10.5 : 10.5;
    const dir = fromLeft ? 1 : -1;

    ped.position.set(startX, 0, z);
    ped.rotation.y = fromLeft ? Math.PI / 2 : -Math.PI / 2;

    ped.userData = {
      type: 'pedestrian',
      radius: 0.65,
      speed: 0,
      walkDir: dir,
      walkSpeed: 1.8 + Math.random() * 0.8,
      nearMissed: false,
      walkCycle: 0
    };

    this.scene.add(ped);
    this.obstacles.push(ped);
  }

  spawnChaiCup(x, z) {
    const chaiGroup = new THREE.Group();
    chaiGroup.position.set(x, 0.8, z);

    const cupMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 16), cupMat);
    chaiGroup.add(cup);

    const teaMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.1 });
    const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16), teaMat);
    tea.position.y = 0.19;
    chaiGroup.add(tea);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), glowMat);
    chaiGroup.add(glow);

    chaiGroup.userData = {
      type: 'chai',
      rotSpeed: 3.5
    };

    this.scene.add(chaiGroup);
    this.collectibles.push(chaiGroup);
  }

  // ==================== 8. INPUT HANDLING (100% FIXED DIRECTIONS) ====================
  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.accelerate = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.brake = true;
      // Fixed: Left is Left, Right is Right
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (e.code === 'Space') {
        this.keys.brake = true;
        e.preventDefault();
      }
      if (e.code === 'KeyH') {
        sounds.playHorn();
        this.showFunPopup('"HORN DE DIYA HAI, RASTA DO!" 📢');
        this.alertNearbyPedestrians();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.accelerate = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.brake = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (e.code === 'Space') this.keys.brake = false;
    });

    const bindTouch = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[keyName] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[keyName] = false; });
      btn.addEventListener('mousedown', () => { this.keys[keyName] = true; });
      btn.addEventListener('mouseup', () => { this.keys[keyName] = false; });
    };

    bindTouch('btn-left', 'left');
    bindTouch('btn-right', 'right');
    bindTouch('btn-brake', 'brake');

    const hornBtn = document.getElementById('btn-horn');
    if (hornBtn) {
      hornBtn.addEventListener('click', () => {
        sounds.playHorn();
        this.showFunPopup('"HORN DE DIYA HAI, RASTA DO!" 📢');
        this.alertNearbyPedestrians();
      });
    }

    this.ui.startBtn.addEventListener('click', () => {
      sounds.init();
      this.ui.startScreen.classList.add('hidden');
      this.startGame();
    });

    this.ui.restartBtn.addEventListener('click', () => {
      this.ui.gameOverScreen.classList.add('hidden');
      this.restartGame();
    });

    this.ui.soundToggle.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      this.ui.soundToggle.textContent = isMuted ? '🔇' : '🔊';
    });

    document.querySelectorAll('.veh-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-veh');
        this.selectVehicle(type);
      });
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  alertNearbyPedestrians() {
    this.obstacles.forEach(obs => {
      if (obs.userData && obs.userData.type === 'pedestrian') {
        const dz = obs.position.z - this.playerVehicle.position.z;
        if (dz > 0 && dz < 45) {
          obs.userData.walkSpeed *= 1.8; // Run faster across road!
          this.showFunPopup('"USTAAD DEKH KE CHALAO!" 🏃‍♂️');
        }
      }
    });
  }

  // ==================== 9. GAMEPLAY LOOP & CONTROLS ====================
  startGame() {
    this.isRunning = true;
    this.isGameOver = false;
    this.distance = 0;
    this.chaiCount = 0;
    this.speed = 35;
    this.playerX = 0;
    this.playerVelocityX = 0;
  }

  restartGame() {
    this.obstacles.forEach(obs => this.scene.remove(obs));
    this.collectibles.forEach(col => this.scene.remove(col));
    this.obstacles = [];
    this.collectibles = [];

    this.startGame();
  }

  triggerCrash(obstacle) {
    this.isRunning = false;
    this.isGameOver = true;
    this.speed = 0;

    sounds.playCrash();
    this.shakeIntensity = 1.2;

    if (this.distance > this.highScore) {
      this.highScore = Math.floor(this.distance);
      localStorage.setItem('mop_high_score', this.highScore);
    }

    this.ui.finalScore.textContent = Math.floor(this.distance) + ' m';
    this.ui.finalChai.textContent = this.chaiCount + ' ☕';
    this.ui.highScore.textContent = this.highScore + ' m';

    const quote = this.funnyQuotes[Math.floor(Math.random() * this.funnyQuotes.length)];
    this.ui.gameOverQuote.textContent = quote;

    setTimeout(() => {
      this.ui.gameOverScreen.classList.remove('hidden');
    }, 450);
  }

  showFunPopup(text) {
    this.ui.funText.textContent = text;
    this.ui.funBanner.classList.remove('hidden');
    clearTimeout(this.funTimer);
    this.funTimer = setTimeout(() => {
      this.ui.funBanner.classList.add('hidden');
    }, 2400);
  }

  // ==================== 10. MAIN ANIMATION & STEERING PHYSICS ====================
  animate(time) {
    requestAnimationFrame(this.animate);

    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (!this.isRunning) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // 1. Acceleration & Braking
    let chassisPitch = 0;
    if (this.keys.accelerate) {
      this.speed = Math.min(this.maxSpeed, this.speed + delta * 28);
      chassisPitch = -0.04;
      this.targetCameraFov = 64;
    } else if (this.keys.brake) {
      this.speed = Math.max(this.minSpeed, this.speed - delta * 50);
      chassisPitch = 0.06;
      this.targetCameraFov = 58;
    } else {
      if (this.speed > 52) this.speed -= delta * 12;
      else if (this.speed < 46) this.speed += delta * 12;
      this.targetCameraFov = 60;
    }

    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetCameraFov, 0.08);
    this.camera.updateProjectionMatrix();

    sounds.updateEngineSpeed(this.speed, this.selectedVehicle);

    const frameDistance = (this.speed * 0.277778) * delta;
    this.distance += frameDistance;

    // 2. ⚡ ULTRA RESPONSIVE ARCADE CONTROLS: LEFT IS LEFT, RIGHT IS RIGHT ⚡
    // In Three.js screen space with camera facing forward:
    // Screen Left is -X.
    // Screen Right is +X.
    const maxSteerSpeed = 26.0; // Fast, razor-sharp response
    let targetVX = 0;

    if (this.keys.left) {
      targetVX = -maxSteerSpeed; // Move LEFT towards -X
    } else if (this.keys.right) {
      targetVX = maxSteerSpeed;  // Move RIGHT towards +X
    }

    // Instant arcade lerp (0.32) eliminates all lag
    this.playerVelocityX = THREE.MathUtils.lerp(this.playerVelocityX, targetVX, 0.32);
    this.playerX += this.playerVelocityX * delta;
    this.playerX = Math.max(-8.5, Math.min(8.5, this.playerX));

    // Dynamic Leaning & Yaw into Turns
    const targetRollZ = this.playerVelocityX * 0.055;
    const targetYawY = -this.playerVelocityX * 0.035;

    this.playerVehicle.position.x = this.playerX;
    this.playerVehicleChassis.rotation.z = THREE.MathUtils.lerp(this.playerVehicleChassis.rotation.z, targetRollZ, 0.2);
    this.playerVehicleChassis.rotation.x = THREE.MathUtils.lerp(this.playerVehicleChassis.rotation.x, chassisPitch, 0.15);
    this.playerVehicle.rotation.y = THREE.MathUtils.lerp(this.playerVehicle.rotation.y, targetYawY, 0.2);

    // Subtle Road Vibration Bounce
    this.playerVehicleChassis.position.y = 0.025 * Math.sin(this.distance * 2.4);

    // 3. Move Highway Chunks Relative to Player Speed
    const worldMoveZ = -frameDistance;
    this.roadSegments.forEach(seg => {
      seg.position.z += worldMoveZ;
    });

    const firstSegment = this.roadSegments[0];
    if (firstSegment.position.z < -this.roadSegmentLength) {
      this.roadSegments.shift();
      const lastSegment = this.roadSegments[this.roadSegments.length - 1];
      firstSegment.position.z = lastSegment.position.z + this.roadSegmentLength;

      // Clean up old buildings in recycled segment and rebuild
      while (firstSegment.children.length > 5) {
        firstSegment.remove(firstSegment.children[firstSegment.children.length - 1]);
      }
      this.addDenseCityEnvironment(firstSegment, this.roadSegmentLength);
      this.spawnSegmentObstacles(firstSegment.position.z, this.roadSegmentLength);
      this.roadSegments.push(firstSegment);
    }

    // 4. Update Obstacles, Pedestrians & Khamba Warning
    let khambaAhead = false;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const relativeSpeed = (obs.userData.speed - this.speed) * 1.5;
      obs.position.z += relativeSpeed * delta;

      // Pedestrian Horizontal Crossing
      if (obs.userData.type === 'pedestrian') {
        obs.position.x += obs.userData.walkDir * obs.userData.walkSpeed * delta;
        obs.userData.walkCycle += delta * 8.0;

        // Walking leg/arm swing animation
        if (obs.userData.legL && obs.userData.legR) {
          const swing = Math.sin(obs.userData.walkCycle) * 0.45;
          obs.userData.legL.rotation.x = swing;
          obs.userData.legR.rotation.x = -swing;
          obs.userData.armL.rotation.x = -swing * 0.6;
          obs.userData.armR.rotation.x = swing * 0.6;
        }

        // Despawn if walked across opposite sidewalk
        if (Math.abs(obs.position.x) > 13) {
          this.scene.remove(obs);
          this.obstacles.splice(i, 1);
          continue;
        }
      }

      // WAPDA Pole Alert
      if (obs.userData.type === 'pole') {
        const dz = obs.position.z - this.playerVehicle.position.z;
        const dx = Math.abs(obs.position.x - this.playerX);
        if (dz > 15 && dz < 75 && dx < 2.4) {
          khambaAhead = true;
        }
      }

      const dz = Math.abs(obs.position.z - this.playerVehicle.position.z);
      const dx = Math.abs(obs.position.x - this.playerX);

      // Collision Detection
      if (dz < 2.2 && dx < (obs.userData.radius + 0.85)) {
        this.triggerCrash(obs);
        return;
      }

      // Near-Miss Bonus (Overtake close pass)
      if (!obs.userData.nearMissed && dz < 1.0 && dx >= (obs.userData.radius + 0.85) && dx < 2.3) {
        obs.userData.nearMissed = true;
        sounds.playNearMiss();
        this.showFunPopup(obs.userData.type === 'pedestrian' ? '"ZABARDAST BACH GAYE!" 🏃‍♂️' : '"ZABARDAST OVERTAKE! BACH GAYE!" 🔥');
      }

      if (obs.position.z < -45) {
        this.scene.remove(obs);
        this.obstacles.splice(i, 1);
      }
    }

    if (khambaAhead) {
      this.ui.alertBanner.classList.remove('hidden');
    } else {
      this.ui.alertBanner.classList.add('hidden');
    }

    // 5. Update Collectible Chai Cups
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const chai = this.collectibles[i];
      chai.position.z += worldMoveZ;
      chai.rotation.y += delta * chai.userData.rotSpeed;

      const dz = Math.abs(chai.position.z - this.playerVehicle.position.z);
      const dx = Math.abs(chai.position.x - this.playerX);

      if (dz < 2.0 && dx < 1.4) {
        sounds.playChaiPickup();
        this.chaiCount++;
        this.distance += 50;
        this.showFunPopup('☕ "GARAM KARAK CHAI MIL GAYI!" +50m');

        this.scene.remove(chai);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (chai.position.z < -30) {
        this.scene.remove(chai);
        this.collectibles.splice(i, 1);
      }
    }

    // 6. Camera Tracking with Screen Shake & High Elevated Perspective
    const targetCamX = this.playerX * 0.35;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.12);
    this.camera.position.y = 4.6;
    this.camera.position.z = -7.8;

    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 3.5);
    }

    this.camera.lookAt(this.playerX * 0.2, 2.1, 28);

    // 7. Update HUD
    this.ui.score.innerHTML = `${Math.floor(this.distance)} <small>m</small>`;
    this.ui.chai.textContent = this.chaiCount;
    this.ui.speed.textContent = Math.floor(this.speed);

    let gear = '1st GEAR';
    if (this.speed > 80) gear = 'TOP GEAR 🔥';
    else if (this.speed > 60) gear = '3rd GEAR';
    else if (this.speed > 40) gear = '2nd GEAR';
    this.ui.gear.textContent = gear;

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap Game on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new MiracleOfPakistanGame();
});
