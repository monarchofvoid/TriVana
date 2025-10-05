// ============================================
// PLANET PARAMETERS (Input Constants)
// ============================================
/*
const pl_orbsmax = window.pl_orbsmax;
const pl_rade    = window.pl_rade;
const pl_masse   = window.pl_masse;
const pl_dens    = window.pl_dens;
const pl_eqt     = window.pl_eqt;
*/
// ============================================
// NOISE GENERATION UTILITIES
// ============================================
class NoiseGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
    }
    
    // Simple hash function for seeded randomness
    hash(x, y) {
        let n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }
    
    // 2D Perlin-like noise
    perlin2D(x, y, scale = 1.0) {
        x *= scale;
        y *= scale;
        
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;
        
        const sx = x - x0;
        const sy = y - y0;
        
        const n0 = this.hash(x0, y0);
        const n1 = this.hash(x1, y0);
        const n2 = this.hash(x0, y1);
        const n3 = this.hash(x1, y1);
        
        const ix0 = this.lerp(n0, n1, this.smoothstep(sx));
        const ix1 = this.lerp(n2, n3, this.smoothstep(sx));
        
        return this.lerp(ix0, ix1, this.smoothstep(sy));
    }
    
    // Multi-octave fractal noise
    fractal(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.perlin2D(x, y, frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }
    
    // Gabor-like noise (approximation using multiple sine waves)
    gabor(x, y, frequency = 4.0) {
        const angle1 = this.hash(x * 0.1, y * 0.1) * Math.PI * 2;
        const angle2 = this.hash(x * 0.2, y * 0.2) * Math.PI * 2;
        
        const wave1 = Math.sin(x * frequency * Math.cos(angle1) + y * frequency * Math.sin(angle1));
        const wave2 = Math.sin(x * frequency * Math.cos(angle2) + y * frequency * Math.sin(angle2));
        
        return (wave1 + wave2) * 0.5;
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    smoothstep(t) {
        return t * t * (3 - 2 * t);
    }
}

// ============================================
// STEP 1: PLANET TYPE CLASSIFICATION
// ============================================
function decidePlanetType(radius, mass, density, temperature) {
    const decision = {
        type: '',
        hasAtmosphere: false,
        atmosphereThickness: 0,
        hasSolidSurface: true
    };
    
    // Gas/Ice Giant Detection
    if (radius > 3.0 || (density < 2.0 && radius > 2.0)) {
        decision.type = density < 1.5 ? 'gas_giant' : 'ice_giant';
        decision.hasSolidSurface = false;
        decision.hasAtmosphere = true;
        decision.atmosphereThickness = 1.0;
        return decision;
    }
    
    // Rocky/Terrestrial Planet
    decision.type = 'terrestrial';
    decision.hasSolidSurface = true;
    
    // Atmosphere presence based on mass and temperature
    // Small mass = weak gravity = atmosphere escapes
    // Too hot = atmosphere blown away
    if (mass < 0.3 || temperature > 600) {
        decision.hasAtmosphere = false;
        decision.atmosphereThickness = 0;
    } else if (mass < 0.8 || temperature > 400) {
        decision.hasAtmosphere = true;
        decision.atmosphereThickness = 0.3; // Thin
    } else {
        decision.hasAtmosphere = true;
        decision.atmosphereThickness = mass > 1.2 ? 0.9 : 0.6; // Thick or moderate
    }
    
    return decision;
}

// ============================================
// STEP 2: CLIMATE CLASSIFICATION
// ============================================
function decideClimate(temperature, orbitalDistance, atmosphereThickness) {
    const climate = {
        zone: '',
        hasLiquidWater: false,
        hasVegetation: false,
        hasIce: false,
        hasLava: false,
        cloudCoverage: 0,
        stormIntensity: 0
    };
    
    // Temperature zones
    if (temperature > 1000) {
        climate.zone = 'inferno';
        climate.hasLava = true;
        climate.cloudCoverage = atmosphereThickness * 0.2; // Minimal hazy clouds
    } else if (temperature > 350) {
        climate.zone = 'hot_desert';
        climate.hasIce = false;
        climate.cloudCoverage = atmosphereThickness * 0.1;
    } else if (temperature >= 250 && temperature <= 350) {
        climate.zone = 'temperate';
        climate.hasLiquidWater = atmosphereThickness > 0.3;
        climate.hasVegetation = climate.hasLiquidWater && temperature > 270 && temperature < 320;
        climate.hasIce = true; // Polar ice caps
        climate.cloudCoverage = atmosphereThickness * 0.4;
        climate.stormIntensity = atmosphereThickness * 0.5;
    } else {
        climate.zone = 'frozen';
        climate.hasIce = true;
        climate.hasLiquidWater = false;
        climate.cloudCoverage = atmosphereThickness * 0.2;
    }
    
    return climate;
}

// ============================================
// STEP 3: SURFACE COVERAGE RATIOS
// ============================================
function decideCoverageRatios(climate, planetType, temperature, mass) {
    const coverage = {
        water: 0,
        rock: 0,
        vegetation: 0,
        ice: 0,
        lava: 0,
        clouds: 0,
        storms: 0
    };
    
    // Gas/Ice Giants - only clouds and storms
    if (!planetType.hasSolidSurface) {
        coverage.clouds = 1.0;
        coverage.storms = planetType.type === 'gas_giant' ? 0.3 : 0.15;
        return coverage;
    }
    
    // Solid surface distribution
    if (climate.zone === 'inferno') {
        coverage.lava = 0.4 + Math.random() * 0.3;
        coverage.rock = 1.0 - coverage.lava;
        coverage.clouds = climate.cloudCoverage;
    } else if (climate.zone === 'hot_desert') {
        coverage.rock = 0.95;
        coverage.ice = 0.05; // Minimal polar ice
        coverage.clouds = climate.cloudCoverage;
    } else if (climate.zone === 'temperate') {
        // Earth-like distribution with variation
        coverage.water = 0.5 + (Math.random() - 0.5) * 0.4; // 30-70%
        const landMass = 1.0 - coverage.water;
        
        if (climate.hasVegetation) {
            coverage.vegetation = landMass * (0.3 + Math.random() * 0.3); // 30-60% of land
        }
        coverage.ice = landMass * (0.05 + Math.random() * 0.1); // 5-15% of land (poles)
        coverage.rock = landMass - coverage.vegetation - coverage.ice;
        coverage.clouds = climate.cloudCoverage;
        coverage.storms = climate.stormIntensity * 0.15;
    } else { // frozen
        coverage.ice = 0.7 + Math.random() * 0.2; // 70-90%
        coverage.rock = 1.0 - coverage.ice;
        coverage.clouds = climate.cloudCoverage;
    }
    
    return coverage;
}

// ============================================
// STEP 4: GENERATE PROCEDURAL MASKS
// ============================================
function generateMasks(coverage, resolution = 1024) {
    const noise = new NoiseGenerator(Math.random() * 10000);
    const masks = {};
    
    // Create canvas for mask generation
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(resolution, resolution);
    
    // Helper to create a mask based on threshold
    function createMask(name, threshold, noiseType = 'fractal', params = {}) {
        const maskData = new Uint8ClampedArray(resolution * resolution * 4);
        
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const u = x / resolution;
                const v = y / resolution;
                
                // Generate noise value
                let noiseValue;
                if (noiseType === 'fractal') {
                    noiseValue = noise.fractal(u, v, params.octaves || 6, params.persistence || 0.5);
                } else if (noiseType === 'perlin') {
                    noiseValue = noise.perlin2D(u, v, params.scale || 4);
                } else if (noiseType === 'gabor') {
                    noiseValue = (noise.gabor(u, v, params.frequency || 8) + 1) * 0.5;
                }
                
                // Apply latitude bias for ice caps (poles)
                if (params.latitudeBias) {
                    const lat = Math.abs(v - 0.5) * 2; // 0 at equator, 1 at poles
                    noiseValue = noiseValue * (1 - params.latitudeBias) + lat * params.latitudeBias;
                }
                
                // Apply threshold with transition
                const adjusted = noiseValue + (threshold - 0.5);
                const mask = Math.max(0, Math.min(1, adjusted));
                
                const idx = (y * resolution + x) * 4;
                maskData[idx] = mask * 255;
                maskData[idx + 1] = mask * 255;
                maskData[idx + 2] = mask * 255;
                maskData[idx + 3] = 255;
            }
        }
        
        masks[name] = maskData;
    }
    
    // Generate masks based on coverage
    if (coverage.water > 0) {
        const waterThreshold = 0.5 - (coverage.water - 0.5) * 0.4;
        createMask('water', waterThreshold, 'fractal', { octaves: 5, persistence: 0.6 });
    }
    
    if (coverage.vegetation > 0) {
        const vegThreshold = 0.5 - (coverage.vegetation - 0.3) * 0.5;
        createMask('vegetation', vegThreshold, 'fractal', { octaves: 6, persistence: 0.5 });
    }
    
    if (coverage.ice > 0) {
        const iceThreshold = 0.5 - (coverage.ice - 0.1);
        createMask('ice', iceThreshold, 'fractal', { 
            octaves: 4, 
            persistence: 0.4,
            latitudeBias: 0.7 // Strong polar bias
        });
    }
    
    if (coverage.lava > 0) {
        const lavaThreshold = 0.5 - (coverage.lava - 0.2) * 0.3;
        createMask('lava', lavaThreshold, 'gabor', { frequency: 6 });
    }
    
    if (coverage.clouds > 0) {
        createMask('clouds', 0.3, 'fractal', { octaves: 8, persistence: 0.65 });
    }
    
    if (coverage.storms > 0) {
        createMask('storms', 0.7, 'gabor', { frequency: 12 });
    }
    
    return masks;
}

// ============================================
// STEP 5: LOAD AND BLEND TEXTURES
// ============================================
async function loadTexture(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = path;
    });
}

async function blendTextures(coverage, masks, resolution = 1024) {
    const texturePaths = {
        diffuse: {
            water: 'water/diffuse.webp',
            rock: 'rock/diffuse.webp',
            vegetation: 'vegetation/diffuse.webp',
            ice: 'ice/diffuse.webp',
            lava: 'magma/diffuse.webp',
            clouds: 'clouds/clouds.webp',
            storms: 'clouds/storm.webp'
        },
        roughness: {
            water: 'water/roughness.webp',
            rock: 'rock/roughness.webp',
            vegetation: 'vegetation/roughness.webp',
            ice: 'ice/roughness.webp',
            lava: 'magma/roughness.webp'
        },
        normal: {
            water: 'water/normal.webp',
            rock: 'rock/normal.webp',
            vegetation: 'vegetation/normal.webp',
            ice: 'ice/normal.webp',
            lava: 'magma/normal.webp'
        }
    };
    
    const loadedImages = {}; // We will store loaded Image elements here

    // Helper to load an image
    async function loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Important for canvas
            img.onload = () => resolve(img);
            img.onerror = () => reject(`Failed to load ${path}`);
            img.src = path;
        });
    }

    // Load only the textures we actually need
    const requiredLayers = ['rock', 'water', 'vegetation', 'ice', 'lava', 'clouds', 'storms'];
    for (const layer of requiredLayers) {
        if (coverage[layer] > 0 || layer === 'rock') {
            try {
                loadedImages[layer] = {
                    diffuse: await loadImage(texturePaths.diffuse[layer]),
                    roughness: texturePaths.roughness[layer] ? await loadImage(texturePaths.roughness[layer]) : null,
                    normal: texturePaths.normal[layer] ? await loadImage(texturePaths.normal[layer]) : null,
                };
            } catch (e) { console.warn(e); }
        }
    }

    // --- Canvas Creation ---
    const canvases = {
        diffuse: document.createElement('canvas'),
        roughness: document.createElement('canvas'),
        normal: document.createElement('canvas')
    };
    const contexts = {};
    for (const [key, canvas] of Object.entries(canvases)) {
        canvas.width = resolution;
        canvas.height = resolution;
        contexts[key] = canvas.getContext('2d');
    }

    // --- Blending using Canvas API (More Robust) ---
    // Layering order: Base -> overlays
    const layerOrder = ['rock', 'water', 'vegetation', 'ice', 'lava'];
    const atmosphereOrder = ['clouds', 'storms'];

    // For each map type (diffuse, roughness, normal)
    for (const mapType of Object.keys(canvases)) {
        const ctx = contexts[mapType];

        // 1. Draw the base rock texture everywhere
        if (loadedImages.rock && loadedImages.rock[mapType]) {
            ctx.drawImage(loadedImages.rock[mapType], 0, 0, resolution, resolution);
        } else {
             // If no rock, fill with a default color (especially for normal/roughness)
            if (mapType === 'normal') ctx.fillStyle = 'rgb(128, 128, 255)';
            else if (mapType === 'roughness') ctx.fillStyle = 'rgb(128, 128, 128)';
            else ctx.fillStyle = 'rgb(128, 128, 128)';
            ctx.fillRect(0, 0, resolution, resolution);
        }

        // 2. Sequentially draw other layers on top using their masks
        for (const layer of layerOrder) {
            // Skip the base rock layer, already drawn
            if (layer === 'rock') continue; 
            
            if (loadedImages[layer] && loadedImages[layer][mapType] && masks[layer]) {
                // Save the current state
                ctx.save();
                
                // Create a temporary canvas for the mask
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = resolution;
                maskCanvas.height = resolution;
                const maskCtx = maskCanvas.getContext('2d');
                maskCtx.putImageData(new ImageData(masks[layer], resolution, resolution), 0, 0);

                // Use the mask to clip the drawing area
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(maskCanvas, 0, 0);
                
                // Now, any drawing will only happen where the mask was not black
                ctx.globalCompositeOperation = 'source-in';
                ctx.drawImage(loadedImages[layer][mapType], 0, 0, resolution, resolution);

                // Restore the context to its original state for the next layer
                ctx.restore();
            }
        }
        
        // 3. Draw atmosphere layers (only for diffuse map)
        if(mapType === 'diffuse') {
            for (const layer of atmosphereOrder) {
                if (loadedImages[layer] && loadedImages[layer][mapType] && masks[layer]) {
                    ctx.save();
                    const maskCanvas = document.createElement('canvas');
                    maskCanvas.width = resolution;
                    maskCanvas.height = resolution;
                    const maskCtx = maskCanvas.getContext('2d');
                    maskCtx.putImageData(new ImageData(masks[layer], resolution, resolution), 0, 0);
                    
                    // Set opacity based on the mask's gray value
                    ctx.globalAlpha = 1.0; 
                    ctx.drawImage(maskCanvas, 0, 0);

                    // Blend the cloud texture additively
                    ctx.globalCompositeOperation = 'screen'; // 'screen' or 'lighter' for additive clouds
                    ctx.drawImage(loadedImages[layer][mapType], 0, 0, resolution, resolution);
                    ctx.restore();
                }
            }
        }
    }

    return canvases;
}

let material, raycaster, mouse, planetTooltip, starTooltip;

// ============================================
// MAIN PIPELINE
// ============================================
async function generatePlanetTexture(pl_rade, pl_masse, pl_dens, pl_eqt, pl_orbsmax) {
    // Step 1: Classify planet type
    const planetType = decidePlanetType(pl_rade, pl_masse, pl_dens, pl_eqt);
    console.log("Planet Type:", planetType);
    
    // Step 2: Determine climate
    const climate = decideClimate(pl_eqt, pl_orbsmax, planetType.atmosphereThickness);
    console.log("Climate:", climate);
    
    // Step 3: Calculate coverage ratios
    const coverage = decideCoverageRatios(climate, planetType, pl_eqt, pl_masse);
    console.log("Coverage:", coverage);
    
    // Step 4: Generate procedural masks
    const masks = generateMasks(coverage);
    console.log("Masks generated");
    
    // Step 5: Load and blend textures
    const finalCanvas = await blendTextures(coverage, masks);
    console.log("Texture blending complete");
    
    return finalCanvas;
}

async function regeneratePlanet() {
    const loader = document.getElementById("loader");

    // Show loader and hide the 3D canvas
    loader.style.display = 'block';

    // IMPORTANT: Read the global variables that were set by analysis.js
    const current_pl_rade = window.pl_rade;
    const current_pl_masse = window.pl_masse;
    const current_pl_dens = window.pl_dens;
    const current_pl_eqt = window.pl_eqt;
    const current_pl_orbsmax = window.pl_orbsmax;

    // 2. PASS that fresh data to the texture generator
    const canvases = await generatePlanetTexture(
        current_pl_rade,
        current_pl_masse,
        current_pl_dens,
        current_pl_eqt,
        current_pl_orbsmax
    );

    // Update the material with the new textures
    const diffuseTexture = new THREE.CanvasTexture(canvases.diffuse);
    const roughnessTexture = new THREE.CanvasTexture(canvases.roughness);
    const normalTexture = new THREE.CanvasTexture(canvases.normal);
    
    diffuseTexture.flipY = false;
    roughnessTexture.flipY = false;
    normalTexture.flipY = false;
    
    material.map = diffuseTexture;
    material.roughnessMap = roughnessTexture;
    material.normalMap = normalTexture;
    material.roughness = 4.0;
    material.normalScale.set(0.25, 0.25);
    material.needsUpdate = true;
    
    loader.style.display = 'none';
}

// ============================================
// INTEGRATION WITH THREE.JS
// ============================================
function initSimulation(){
    const container = document.getElementById("SimContainer");
     if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.error("Initialization failed: Container has no dimensions.");
        return; 
    }
    const width = container.clientWidth;
    const height = container.clientHeight;
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    planetTooltip = document.getElementById('planet-tooltip');
    starTooltip = document.getElementById('star-tooltip');
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
   
    camera.position.set(7.35889, 4.92579, 8.95831);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    
    // Create sphere with placeholder material
    const geometry = new THREE.SphereGeometry(2, 128, 128); // Higher resolution for detail
    material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.1,
        roughness: 0.6
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    
    const starMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xFFFF00,       // The color of the light the star emits
        emissiveIntensity: 3.5,    // The strength of the emission. CRITICAL for bloom.
        // We can set other properties to make it non-reflective
        color: 0x000000,          // Base color can be black
        metalness: 0.0,
        roughness: 1.0 
    });

    const starGeometry = new THREE.SphereGeometry(2.0, 32, 32); // A large sphere
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(100, 5, 0); // Position it far away
    const planetPivot = new THREE.Group();

    scene.add(star);

    planetPivot.position.copy(star.position); // Place the pivot at the star's location
    scene.add(planetPivot);

    planetPivot.add(sphere);

    sphere.position.set(-100, -5, 0);

    const renderTarget = new THREE.WebGLMultisampleRenderTarget(
        width,
        height,
        { 
            format: THREE.RGBAFormat, 
            encoding: THREE.sRGBEncoding,
            samples: 4 
        }
    );
    const composer = new POSTPROCESSING.EffectComposer(renderer, renderTarget);
    composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.0); // color, intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    camera.add(directionalLight);
    directionalLight.position.set(10,5,-5);
    directionalLight.castShadow = true; 
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(camera);
    
    // Load HDR environment
    new THREE.RGBELoader()
        .setPath('./')
        .load('OuterSpace.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            
            // Load streak texture for bloom
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('StarBurst.webp', function(streakTexture) {
                streakTexture.wrapS = THREE.RepeatWrapping;
                streakTexture.wrapT = THREE.RepeatWrapping;
                
                const bloomEffect = new POSTPROCESSING.BloomEffect({
                    luminanceThreshold: 0.3,
                    luminanceSmoothing: 0.0,
                    intensity: 2,
                    kernelSize: POSTPROCESSING.KernelSize.SMALL,
                    kernelImage: streakTexture
                });
                
                const contrastEffect = new POSTPROCESSING.BrightnessContrastEffect({
                    contrast: 0.2
                });
                
                const effectPass = new POSTPROCESSING.EffectPass(camera, bloomEffect, contrastEffect);
                composer.addPass(effectPass);
                
                // NOW generate the planet texture
                generatePlanetTexture().then(canvases => { // 'canvases' is the object
                    // Convert each canvas to its own THREE.js texture
                    const diffuseTexture = new THREE.CanvasTexture(canvases.diffuse);
                    const roughnessTexture = new THREE.CanvasTexture(canvases.roughness);
                    const normalTexture = new THREE.CanvasTexture(canvases.normal);
                    
                    // Textures from canvas need to be flipped vertically to match WebGL standards
                    diffuseTexture.flipY = false;
                    roughnessTexture.flipY = false;
                    normalTexture.flipY = false;
                    
                    // Update material with ALL generated textures
                    material.map = diffuseTexture;
                    material.roughnessMap = roughnessTexture;
                    material.normalMap = normalTexture;
                    material.roughness = 4.0;
                    material.normalScale.set(0.25, 0.25);
                    
                    // We need to tell Three.js to update the material properties
                    material.needsUpdate = true;
                    
                    // Start animation
                    animate();
                });
            });
        });

    function onMouseMove(event) {
    // 1. Calculate normalized mouse coordinates (-1 to +1)
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    // 2. Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // 3. Check for intersections
    const intersects = raycaster.intersectObjects([sphere, star]);

    if (intersects.length > 0) {
        // If we hit the planet (sphere)
        if (intersects[0].object === sphere) {
            starTooltip.style.display = 'none'; // Hide the other tooltip
            starTooltip.style.opacity = 0;

            const planetName = window.current_planet_name || `KepID: ${window.current_planet_kepid}`;
            
            // Populate the tooltip with current data
            planetTooltip.innerHTML = `
                <h3>${planetName}</h3>
                <p><strong>Radius:</strong> ${window.pl_rade.toFixed(2)} Earths</p>
                <p><strong>Mass:</strong> ${window.pl_masse.toFixed(2)} Earths</p>
                <p><strong>Density:</strong> ${window.pl_dens.toFixed(2)} g/cm³</p>
                <p><strong>Temp (Eq.):</strong> ${Math.round(window.pl_eqt)} K</p>
            `;
            
            // Position and show the tooltip
            planetTooltip.style.left = `${event.clientX + 15}px`;
            planetTooltip.style.top = `${event.clientY + 15}px`;
            planetTooltip.style.display = 'block';
            planetTooltip.style.opacity = 1;

        } 
        // If we hit the star
        else if (intersects[0].object === star) {
            planetTooltip.style.display = 'none'; // Hide the other tooltip
            planetTooltip.style.opacity = 0;
            
            starTooltip.innerHTML = `<h3>${window.current_hostname}</h3>`;

            starTooltip.style.left = `${event.clientX + 15}px`;
            starTooltip.style.top = `${event.clientY + 15}px`;
            starTooltip.style.display = 'block';
            starTooltip.style.opacity = 1;
        }
    } else {
        // If the mouse is not over any object, hide both tooltips
        planetTooltip.style.opacity = 0;
        starTooltip.style.opacity = 0;
        
        // Use a timeout to set display to none after fade out transition
        setTimeout(() => {
            if (planetTooltip.style.opacity == 0) planetTooltip.style.display = 'none';
            if (starTooltip.style.opacity == 0) starTooltip.style.display = 'none';
        }, 200); // Should match your CSS transition time
    }
}

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta(); // Get the time elapsed since the last frame
        sphere.rotation.y += 0.1 * delta;
        controls.update();
        composer.render(clock.getDelta());
    }
}

window.regeneratePlanet = regeneratePlanet;
window.initSimulation = initSimulation;

