
const ExoplanetViewer = () => {
  const canvasRef = React.useRef(null);
  const imageCache = React.useRef(new Map());
  const [selectedPlanet, setSelectedPlanet] = React.useState(0);
  const [isInitialPlanetLoaded, setIsInitialPlanetLoaded] = React.useState(false);
  const [backgroundStyle, setBackgroundStyle] = React.useState({});
  const [hoveredBody, setHoveredBody] = React.useState(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });


  // Exoplanet data with realistic information
  const exoplanets = [
    {
      name: "51 PEGASI B",
      galaxy: "Milky Way",
      diameter: "1.9 Jupiter radii",
      dayLength: "4.23 Earth days",
      avgTemperature: "1000°C",
      climate: "Hot Jupiter",
      color: "#FF6B35",
      textureFile: "51PegasiB.webp",
      backgroundFile: "51PegasiB_background.webp" 
    },
    {
      name: "KEPLER-452B",
      galaxy: "Milky Way", 
      diameter: "1.6 Earth radii",
      dayLength: "385 Earth days",
      avgTemperature: "5°C",
      climate: "Temperate",
      color: "#4A90E2",
      textureFile: "Kepler452b.webp",
      backgroundFile: "Kepler452b_background.webp" 
    },
    {
      name: "PROXIMA CENTAURI B",
      galaxy: "Milky Way",
      diameter: "1.17 Earth radii", 
      dayLength: "11.2 Earth days",
      avgTemperature: "-39°C",
      climate: "Cold Desert",
      color: "#B8860B",
      textureFile: "ProximaCentauriB.webp",
      backgroundFile: "ProximaCentauriB_background.webp" 
    },
    {
      name: "TRAPPIST-1E",
      galaxy: "Milky Way",
      diameter: "0.91 Earth radii",
      dayLength: "6.1 Earth days", 
      avgTemperature: "-22°C",
      climate: "Potentially Habitable",
      color: "#0D98BA",
      textureFile: "Trappist1e.webp",
      backgroundFile: "Trappist1e_background.webp" 
    },
    {
      name: "COROT-7B",
      galaxy: "Milky Way",
      diameter: "1.68 Earth radii",
      dayLength: "20.4 Earth hours",
      avgTemperature: "2000°C",
      climate: "Lava World",
      color: "#DC143C",
      textureFile: "Corot7b.webp",
      backgroundFile: "Corot7b_background.webp" 
    },
    {
      name: "GLIESE 667C",
      galaxy: "Milky Way", 
      diameter: "1.54 Earth radii",
      dayLength: "28.1 Earth days",
      avgTemperature: "-12°C",
      climate: "Super Earth",
      color: "#FF5349",
      textureFile: "Gliese667c.webp",
      backgroundFile: "Gliese667c_background.webp" 
    }
  ];

  React.useEffect(() => {
      const currentPlanet = exoplanets[selectedPlanet];
      if (currentPlanet && currentPlanet.backgroundFile) {
          setBackgroundStyle({
              backgroundImage: `radial-gradient(ellipse 50% 50% at center, rgba(0,0,0,0.1),#000), url('${currentPlanet.backgroundFile}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              borderRadius: '12px', 
              padding: '2rem', 
              transition: 'background-image 0.8s ease-in-out' 
          });
      }
  }, [selectedPlanet]);

  // Planet proximity mapping based on RA, Dec, and distance from NASA's archive
  const planetProximity = {
    "51 PEGASI B": [3, 2, 5], // trappist-1e, proxima centauri b, gliese 667 c
    "KEPLER-452B": [0, 3, 5], // 51 pegasi b, trappist-1e, gliese 667 c
    "PROXIMA CENTAURI B": [5, 3, 0], // gliese 667c, trappist-1e, 51 pegasi b
    "TRAPPIST-1E": [0, 2, 5], // 51 pegasi b, proxima centauri b, gliese 667 c
    "COROT-7B": [2, 5, 3], // proxima centauri b, gliese 667 c, trappist-1e
    "GLIESE 667C": [2, 3, 0] // proxima centauri b, trappist-1e, 51 pegasi b
  };

  // Simple LCG (Linear Congruential Generator) for consistent randomness
  const lcgRandom = (seed) => {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    seed = Math.abs(seed) % m;
    return ((a * seed + c) % m) / m;
  };

  // Generate orbital bodies positioned on rings
  const generateOrbitalBodies = (planetName, centerX, centerY, ringRadii) => {
    const bodies = [];
    const baseSeed = Math.pow(planetName.length, 3);
    const linkedPlanets = planetProximity[planetName] || [0, 1, 2];
    
    ringRadii.forEach((radius, ringIndex) => {
      const intermediateSeed = baseSeed * 37 + ringIndex * 73;
      const currentSeed = Math.pow(intermediateSeed, 2);
      const randomValue = lcgRandom(currentSeed);
      
      const angle = randomValue * 360;
      const angleRad = (angle * Math.PI) / 180;
      
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius;
      
      const finalX = x + centerX;
      const finalY = y + centerY;
      
      const bodySize = Math.max(2, 5 - ringIndex);
      const opacity = Math.max(0.4, 0.9 - ringIndex * 0.2);
      
      bodies.push({
        x: finalX,
        y: finalY,
        size: bodySize,
        opacity: opacity,
        color: ringIndex % 2 === 0 ? '#FFD700' : ringIndex % 3 === 0 ? '#4A90E2' : '#FF6B47',
        linkedPlanetIndex: linkedPlanets[ringIndex],
        linkedPlanetName: exoplanets[linkedPlanets[ringIndex]]?.name || "Unknown",
        ringIndex: ringIndex
      });
    });
    
    return bodies;
  };

  // Load texture from file stream
  const loadTexture = async (planet) => {

      const imageUrl = planet.textureFile;
      try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Texture not found');
          const blob = await response.blob();
          return URL.createObjectURL(blob);
      } catch (error) {
          console.warn(`Could not load texture ${imageUrl}. Using procedural fallback.`);
          return generatePlanetTexture(planet.textureFile.replace('.webp', ''), planet.color);
      }
  };

  // Generate procedural planet texture
  const generatePlanetTexture = (type, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    
    switch(type) {
      case '51PegasiB':
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.3, '#FF6347');
        gradient.addColorStop(0.7, '#FF8C00');
        gradient.addColorStop(1, '#FFD700');
        break;
      case 'Kepler452b':
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#4682B4');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(0.8, '#8FBC8F');
        gradient.addColorStop(1, '#F0E68C');
        break;
      case 'ProximaCentauriB':
        gradient.addColorStop(0, '#D2B48C');
        gradient.addColorStop(0.4, '#CD853F');
        gradient.addColorStop(0.7, '#A0522D');
        gradient.addColorStop(1, '#8B4513');
        break;
      case 'Trappist1e':
        gradient.addColorStop(0, '#6495ED');
        gradient.addColorStop(0.3, '#4169E1');
        gradient.addColorStop(0.6, '#228B22');
        gradient.addColorStop(1, '#32CD32');
        break;
      case 'Corot7b':
        gradient.addColorStop(0, '#8B0000');
        gradient.addColorStop(0.3, '#DC143C');
        gradient.addColorStop(0.6, '#FF4500');
        gradient.addColorStop(1, '#FFD700');
        break;
      case 'Gliese667c':
        gradient.addColorStop(0, '#483D8B');
        gradient.addColorStop(0.4, '#6A5ACD');
        gradient.addColorStop(0.7, '#9370DB');
        gradient.addColorStop(1, '#DDA0DD');
        break;
      default:
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = Math.random() * 3;
      const opacity = Math.random() * 0.3;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas.toDataURL();
  };

  // Draw orbital system with interactive bodies
  const drawOrbitalSystem = (ctx, centerX, centerY, planetRadius, planetName) => {
    const ringRadii = [
      planetRadius + 120,
      planetRadius + 180, 
      planetRadius + 240
    ];
    
    const ringStyles = [
      { opacity: 0.3, width: 1 },
      { opacity: 0.2, width: 0.8 },
      { opacity: 0.15, width: 0.6 }
    ];

    // Draw rings
    ringRadii.forEach((radius, i) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringStyles[i].opacity})`;
      ctx.lineWidth = ringStyles[i].width;
      ctx.stroke();
    });
    
    // Generate orbital bodies
    const bodies = generateOrbitalBodies(planetName, centerX, centerY, ringRadii);
    
    // Draw bodies
    bodies.forEach((body, index) => {
      // Save context for glow effect
      ctx.save();
      
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.size, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      ctx.globalAlpha = body.opacity;
      
      // Add glow effect
      ctx.shadowColor = body.color;
      ctx.shadowBlur = body.size * 2;
      ctx.fill();
      
      // Restore context
      ctx.restore();
      
      // Store index for reference
      body.index = index;
    });
    
    return bodies;
  };

  // Handle canvas interactions
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.orbitalBodies) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x: e.clientX, y: e.clientY });
    
    // Check if mouse is over any orbital body
    let hoveredBodyIndex = null;
    canvas.orbitalBodies.forEach((body, index) => {
      const distance = Math.sqrt(Math.pow(mouseX - body.x, 2) + Math.pow(mouseY - body.y, 2));
      const hitRadius = body.size + 8; // Increased hit area for easier interaction
      
      if (distance <= hitRadius) {
        hoveredBodyIndex = index;
      }
    });
    
    if (hoveredBodyIndex !== hoveredBody) {
      setHoveredBody(hoveredBodyIndex);
      canvas.style.cursor = hoveredBodyIndex !== null ? 'pointer' : 'default';
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.orbitalBodies) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check if click is on any orbital body
    canvas.orbitalBodies.forEach((body) => {
      const distance = Math.sqrt(Math.pow(mouseX - body.x, 2) + Math.pow(mouseY - body.y, 2));
      if (distance <= body.size + 8) {
        setSelectedPlanet(body.linkedPlanetIndex);
        setHoveredBody(null);
      }
    });
  };

  React.useEffect(() => {
      exoplanets.forEach((planet,index) => {
          if (!imageCache.current.has(planet.textureFile)) {
              const img = new Image();
              img.src = planet.textureFile; // Start loading
              img.onload = () => {
                  // Once loaded, store the complete, decoded Image object in the cache
                  imageCache.current.set(planet.textureFile, img);
                  if (index === 0) {
                    setIsInitialPlanetLoaded(true);
                  }
              };
              img.onerror = () => {
                  console.error(`Failed to pre-load texture: ${planet.textureFile}`);
              };
          }
      });
  }, []);

  // Static rendering
  const renderCurrentPlanet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentPlanet = exoplanets[selectedPlanet];
    const img = imageCache.current.get(currentPlanet.textureFile);

    if (!img) {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '16px Inter';
        ctx.fillText('Loading texture...', canvas.width / 2, canvas.height / 2);
        return; 
    }

    const maxDisplaySize = Math.min(canvas.width, canvas.height) * 0.6; 
    const ratio = Math.min(maxDisplaySize / img.width, maxDisplaySize / img.height);
    const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                const x = (canvas.width - newWidth) / 2;
                const y = (canvas.height - newHeight) / 2;

                ctx.shadowColor = 'rgba(0,0,0,0.9)';
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = -15;
                ctx.shadowOffsetY = 20;

                // 2. Draw the pre-rendered sphere image
                ctx.drawImage(img, x, y, newWidth, newHeight);

                ctx.shadowColor = 'transparent'; 
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // 3. Define the center and radius based on the DRAWN image
                const centerX = x + newWidth / 2;
                const centerY = y + newHeight / 2;
                const planetRadius = newWidth / 2;

                // 4. Add the bloom/glow effect for visual flair
                const blurRadius = 25;
                ctx.filter = `blur(${blurRadius}px)`;
                ctx.shadowColor = currentPlanet.color;
                ctx.shadowBlur = 50;
                ctx.globalCompositeOperation = 'screen';
                ctx.beginPath();
                ctx.arc(centerX, centerY, planetRadius + 15, 0, Math.PI * 2);
                ctx.fillStyle = `${currentPlanet.color}10`;
                ctx.fill();
                ctx.filter = 'none';
                ctx.globalCompositeOperation = 'source-over';
                ctx.shadowBlur = 0;

                // 5. Draw the orbital system around the image
                const bodies = drawOrbitalSystem(ctx, centerX, centerY, planetRadius, currentPlanet.name);
                
                // 6. Make the orbital bodies interactive
                if (canvasRef.current) {
                    canvasRef.current.orbitalBodies = bodies;
                }
            };

  React.useEffect(() => {
    renderCurrentPlanet();
  }, [selectedPlanet, isInitialPlanetLoaded]); // Only re-render when planet changes

  const currentPlanet = exoplanets[selectedPlanet];
  const hoveredPlanetName = hoveredBody !== null && canvasRef.current?.orbitalBodies 
    ? canvasRef.current.orbitalBodies[hoveredBody]?.linkedPlanetName 
    : null;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      color: 'white',
      padding: '25px',
      borderRadius: '40px',
      overflow: 'hidden'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      fontSize: '0.875rem'
    },
    navSection: {
      display: 'flex',
      gap: '2rem'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      transition: 'color 0.3s',
      cursor: 'pointer'
    },
    brandText: {
      fontSize: '0.75rem',
      letterSpacing: '0.2em'
    },
    planetSelector: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    selectorContainer: {
      display: 'flex',
      gap: '0.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '9999px',
      padding: '0.5rem',
      backdropFilter: 'blur(4px)'
    },
    planetButton: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      transition: 'all 0.3s',
      border: 'none',
      cursor: 'pointer'
    },
    planetButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white'
    },
    planetButtonInactive: {
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    mainContent: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    planetTitle: {
      fontSize: '3.75rem',
      fontWeight: '100',
      letterSpacing: '0.2em',
      marginBottom: '3rem',
      background: 'linear-gradient(to right, #93c5fd, #c4b5fd)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      maxWidth: '64rem',
      margin: '0 auto 3rem auto',
      fontSize: '0.875rem'
    },
    infoItem: {
      textAlign: 'center'
    },
    infoLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem',
      letterSpacing: '0.1em'
    },
    infoValue: {
      color: 'white'
    },
    climateSection: {
      marginBottom: '2rem'
    },
    canvasContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    },
    canvas: {
      maxWidth: '100%',
      height: 'auto',
      filter: 'drop-shadow(0 0 50px rgba(255, 255, 255, 0.1))'
    },
    tooltip: {
      position: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      pointerEvents: 'none',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  return (
    <div style={{ ...styles.container, ...backgroundStyle }}>
      {/* Planet Selector */}
      <div style={styles.planetSelector}>
        <div style={styles.selectorContainer}>
          {exoplanets.map((planet, index) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(index)}
              style={{
                ...styles.planetButton,
                ...(selectedPlanet === index ? styles.planetButtonActive : styles.planetButtonInactive)
              }}
              onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.target.style.color = selectedPlanet === index ? 'white' : 'rgba(255, 255, 255, 0.6)'}
            >
              {planet.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.planetTitle}>
          {currentPlanet.name}
        </h1>
        
        {/* Planet Info Grid */}
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>GALAXY</div>
            <div style={styles.infoValue}>{currentPlanet.galaxy}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>DIAMETER</div>
            <div style={styles.infoValue}>{currentPlanet.diameter}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>DAY LENGTH</div>
            <div style={styles.infoValue}>{currentPlanet.dayLength}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>AVG TEMPERATURE</div>
            <div style={styles.infoValue}>{currentPlanet.avgTemperature}</div>
          </div>
        </div>
        
        <div style={styles.climateSection}>
          <div style={styles.infoLabel}>CLIMATE</div>
          <div style={styles.infoValue}>{currentPlanet.climate}</div>
        </div>
      </div>

      {/* Planet Canvas */}
      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={styles.canvas}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          onMouseLeave={() => setHoveredBody(null)}
        />
      </div>

      {/* Tooltip */}
      {hoveredPlanetName && (
        <div
          style={{
            ...styles.tooltip,
            left: mousePos.x + 10,
            top: mousePos.y - 30
          }}
        >
          {hoveredPlanetName}
        </div>
      )}
    </div>
  );
};

const domNode = document.getElementById('react-exoplanet-viewer');
const root = ReactDOM.createRoot(domNode);
root.render(React.createElement(ExoplanetViewer));

