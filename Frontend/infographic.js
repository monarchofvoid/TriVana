document.addEventListener("DOMContentLoaded", () => {
        let animationId;
        let isPlaying = false;
        let startTime = Date.now();
        let speed = 1;
        let planetRadius = 12;
        let lightCurvePoints = [];
        let time = 0;
        
        const star = document.getElementById('star');
        const planet = document.getElementById('planet');
        const lightCurve = document.getElementById('lightCurve');
        const timeIndicator = document.getElementById('timeIndicator');
        const planetLabel = document.getElementById('planetLabel');
        
        function updatePlanetPosition(t) {
            // Orbital parameters
            const orbitRadius = 120;
            const centerX = 250;
            const centerY = 150;
            const starRadius = 40;
            
            // Calculate planet position
            const angle = t * speed * 0.01;
            const planetX = centerX + orbitRadius * Math.cos(angle);
            const planetY = centerY + 8 * Math.sin(angle); // Slight ellipse for 3D effect
            
            // Update planet position
            planet.setAttribute('cx', planetX);
            planet.setAttribute('cy', planetY);
            planetLabel.setAttribute('x', planetX);
            planetLabel.setAttribute('y', planetY - 20);
            
            // Handle transit effect - planet should fade when behind star (being eclipsed)
            const distanceFromCenter = Math.abs(planetX - centerX);
            
            // Normalize angle to 0-2π range
            const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            
            // Planet is behind star when angle is roughly between π and 2π (180° to 360°)
            // But we only want it to dim when it's close to the star AND in the back portion
            if (distanceFromCenter < starRadius + planetRadius && 
                normalizedAngle > Math.PI && normalizedAngle < Math.PI * 2) {
                // Planet is behind star - dim it to show eclipse effect
                planet.style.opacity = '0.3';
            } else {
                // Planet is either far from star or in front of star - full opacity
                planet.style.opacity = '1';
            }
            
            return { planetX, distanceFromCenter, starRadius, angle };
        }
        
        function updateLightCurve(t, planetX, distanceFromCenter, starRadius, angle) {
            // Calculate brightness based on transit
            let brightness = 100; // Base brightness
            
            // Check if planet is transiting (in front of star)
            // Planet blocks light when it's close to star AND in front (angle between 0 and π)
            const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            const isInFront = (normalizedAngle >= 0 && normalizedAngle <= Math.PI);
            
            if (distanceFromCenter < starRadius + planetRadius && isInFront) {
                // Calculate transit depth based on planet/star radius ratio
                const transitDepth = (planetRadius / starRadius) * (planetRadius / starRadius) * 50;
                brightness = 100 - transitDepth;
            }
            
            // Map brightness to graph coordinates
            const graphX = 50 + (t * speed * 0.2) % 400;
            const graphY = 250 - brightness * 1.5;
            
            // Check if we've wrapped around (graphX is smaller than the last point)
            const lastX = lightCurvePoints.length > 0 ? 
                parseFloat(lightCurvePoints[lightCurvePoints.length - 1].split(',')[0]) : 50;
            
            // If graphX wrapped around, clear the points to start fresh
            if (graphX < lastX && lightCurvePoints.length > 0) {
                lightCurvePoints = [];
            }
            
            // Add point to light curve
            lightCurvePoints.push(`${graphX},${graphY}`);
            
            // Keep only recent points to prevent performance issues
            if (lightCurvePoints.length > 200) {
                lightCurvePoints.shift();
            }
            
            // Update light curve path
            lightCurve.setAttribute('points', lightCurvePoints.join(' '));
            
            // Update time indicator
            timeIndicator.setAttribute('x1', graphX);
            timeIndicator.setAttribute('x2', graphX);
        }
        
        function animate() {
            if (!isPlaying) return;
            
            time += 2;
            
            const { planetX, distanceFromCenter, starRadius, angle } = updatePlanetPosition(time);
            updateLightCurve(time, planetX, distanceFromCenter, starRadius, angle);
            
            animationId = requestAnimationFrame(animate);
        }
        
        function toggleAnimation() {
            isPlaying = !isPlaying;
            if (isPlaying) {
                animate();
            } else {
                cancelAnimationFrame(animationId);
            }
        }
        
        function resetAnimation() {
            isPlaying = false;
            cancelAnimationFrame(animationId);
            time = 0;
            lightCurvePoints = [];
            lightCurve.setAttribute('points', '50,100');
            planet.setAttribute('cx', 370);
            planet.setAttribute('cy', 150);
            planet.style.opacity = '1';
            planetLabel.setAttribute('x', 370);
            planetLabel.setAttribute('y', 130);
            timeIndicator.setAttribute('x1', 50);
            timeIndicator.setAttribute('x2', 50);
            isPlaying = true;
            animate();
        }
        
        function updateSpeed() {
            speed = parseFloat(document.getElementById('speedControl').value);
        }
        
        function updatePlanetSize() {
            planetRadius = parseInt(document.getElementById('planetSize').value);
            planet.setAttribute('r', planetRadius);
        }
        
        // Initialize
        resetAnimation();
        
        // Add event listeners for external script compatibility
        document.getElementById('playPauseBtn').addEventListener('click', toggleAnimation);
        document.getElementById('resetBtn').addEventListener('click', resetAnimation);
        document.getElementById('speedControl').addEventListener('input', updateSpeed);
        document.getElementById('planetSize').addEventListener('input', updatePlanetSize);
});