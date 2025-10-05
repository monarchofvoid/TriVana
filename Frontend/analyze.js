window.pl_orbsmax = null;
window.pl_rade    = null;
window.pl_masse   = null;
window.pl_dens    = null;
window.pl_eqt     = null;

document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.querySelector(".analyze-btn");
    const resultsSection = document.getElementById("results");
    const loader = document.getElementById("loader");
    const simContainer = document.getElementById("SimContainer");
    const fileInput = document.getElementById("fileInput"); // The file input element
    const analysisResultDiv = document.getElementById("analysisResult"); // Div to show 

    let planetData = [];
    let isSimulationInitialized = false;
    let selectedFeatures = null;

    // --- Load JSON with all planets ---
    async function loadPlanetData() {
        try {
            const response = await fetch("clean_labels_with_derived_cleaned.json");
            planetData = await response.json();
            console.log("Planet data ready for analysis:", planetData.length, "entries");
        } catch (error) {
            console.error("Failed to load planet data:", error);
        }
    }

    function masterAnalyze() {
        // BRANCH: Check if a file has been selected in the file input.
        if (fileInput.files.length > 0) {
            handleFileUpload();
        } else {
            analyzePlanet();
        }
    }

     async function handleFileUpload() {
        console.log("File detected. Starting analysis via API...");
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file); // The key "file" must match what the API expects

        // Provide immediate feedback to the user
        analysisResultDiv.innerHTML = `<p>Analyzing light curve from ${file.name}...</p>`;
        analysisResultDiv.style.display = 'block'; // Make sure the container is visible

        try {
            // The API endpoint for your model
            const apiUrl = "http://localhost:8000/predict";

            const response = await fetch(apiUrl, {
                method: "POST", 
                body: formData
            });

            if (!response.ok) {
                // Handle server errors (e.g., 500, 404)
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            // --- Log the result to the console as requested ---
            console.log("API Prediction Response:", data);

            // Display the prediction results to the user
            const probabilityPercent = (data.probability * 100).toFixed(2);
            analysisResultDiv.innerHTML = `
                <h3>Light Curve Analysis Complete</h3>
                <p>Prediction: <strong>${data.prediction}</strong></p>
                <p>Probability of Exoplanet: <strong>${probabilityPercent}%</strong></p>
            `;
            // This is the flag for your next step.
            if (data.prediction === 'CONFIRMED') {
                 console.log("FLAG: Proceed to the next API call for feature prediction.");
            }

        } catch (error) {
            console.error("Error during file analysis:", error);
            analysisResultDiv.innerHTML = `<p style="color: red;">Analysis Failed. There was an issue communicating with the prediction server.</p>`;
        }
    }

    // --- Analyze selected planet ---
    function analyzePlanet() {
        if (typeof getSelectedKepid !== "function") {
            alert("Search script not loaded or connected properly!");
            return;
        }

        const kepid = getSelectedKepid();
        if (!kepid) {
            alert("Please select a planet from the search first!");
            return;
        }

        // Find the planet in JSON
        const planet = planetData.find(p => p.Kepid === kepid);

        if (!planet) {
            alert("No planet data found for Kepid " + kepid);
            return;
        }

        resultsSection.style.display = 'flex';
        analysisResultDiv.style.display = 'none'; 
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

        // 2. Check if we need to initialize the 3D scene
        
        if (!isSimulationInitialized) {
            if (typeof window.initSimulation === "function") {
                window.initSimulation();
                isSimulationInitialized = true;
            } else {
                alert("Simulator script is not ready yet.");
                return;
            }
        }

        window.current_planet_kepid = planet.Kepid;   
        window.pl_orbsmax = planet.features.pl_orbsmax;
        window.pl_rade    = planet.features.pl_rade;
        window.pl_masse   = planet.features.pl_masse;
        window.pl_dens    = planet.features.pl_dens;
        window.pl_eqt     = planet.features.pl_eqt;
        if (typeof window.regeneratePlanet === "function") {
            window.regeneratePlanet();
        } else {
             alert("Planet regenerator is not ready.");
        }
    }

    window.getSelectedFeatures = () => selectedFeatures;
    analyzeBtn.addEventListener("click", masterAnalyze);
    loadPlanetData();
});
