document.addEventListener("DOMContentLoaded", () => {
    // Select all elements by their new, unique IDs
    const showUploadBtn = document.getElementById("showUploadBtn");
    const showSearchBtn = document.getElementById("showSearchBtn");
    const uploadBox = document.getElementById("uploadBox");
    const searchBox = document.getElementById("searchBox");
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearBtn");
    const selectFileBtn = document.getElementById("selectFileBtn");
    const fileInput = document.getElementById("fileInput");
    const fileDisplay = document.getElementById("fileDisplay");
    const fileName = document.getElementById("fileName");
    const uploadPrompt = document.getElementById("uploadPrompt");
    const clearFileBtn = document.getElementById("clearFileBtn");
    const changeFileBtn = document.getElementById("changeFileBtn");
    const changeFileContainer = document.getElementById("changeFileContainer");

    // --- Event listener for the "Select File" button ---
    selectFileBtn.addEventListener("click", () => {
        fileInput.click();
    });

    changeFileBtn.addEventListener("click", () => {
        fileInput.click();
    });

    // --- Updated fileInput change listener ---
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            // Get the name of the first file
            const name = fileInput.files[0].name;
            
            // Update the span with the file name
            fileName.textContent = name;
            changeFileContainer.classList.add("active");
            // Show the file display UI and hide the original prompt
            fileDisplay.classList.add("active");
            uploadPrompt.classList.add("hidden");
        }
    });

    clearFileBtn.addEventListener("click", () => {
        // Reset the file input's value. This is crucial.
        // It allows the user to select the same file again.
        fileInput.value = "";

        // Hide the file display UI
        fileDisplay.classList.remove("active");

        changeFileContainer.classList.remove("active");

        // Show the original upload prompt
        uploadPrompt.classList.remove("hidden");
    });

    // Event listener for the "Search Star ID" button
    showSearchBtn.addEventListener("click", () => {
        uploadBox.classList.add("shrunk");
        searchBox.classList.add("active");
        showSearchBtn.classList.add("btn-primary");
        showSearchBtn.classList.remove("btn-secondary");
        showUploadBtn.classList.add("btn-secondary");
        showUploadBtn.classList.remove("btn-primary");
    });

    // Event listener for the "Upload Data" button
    showUploadBtn.addEventListener("click", () => {
        uploadBox.classList.remove("shrunk");
        searchBox.classList.remove("active");
        showUploadBtn.classList.add("btn-primary");
        showUploadBtn.classList.remove("btn-secondary");
        showSearchBtn.classList.add("btn-secondary");
        showSearchBtn.classList.remove("btn-primary");
    });

    // Event listener for the clear button in the search input
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
    });

    const navLinks = document.querySelectorAll(".main-nav a");
    const uploadSearchSection = document.getElementById("upload-search");
    const resultsSection = document.getElementById("results");
    const exploreSection = document.getElementById("dataset-explorer");
    const aboutSection = document.getElementById("about");
    const contactSection = document.getElementById("contact");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const linkText = link.textContent.trim().toLowerCase();

            switch (linkText) {
                case "home":
                    // Scroll to the top of the page smoothly
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                    break;
                case "upload":
                    // Simulate a click on the "Upload Data" button
                    showUploadBtn.click();
                    // Scroll to the upload/search section
                    uploadSearchSection.scrollIntoView({
                        behavior: "smooth"
                    });
                    break;
                case "visualize":
                    // Scroll to the results/planet visualizer section
                    resultsSection.scrollIntoView({
                        behavior: "smooth"
                    });
                    break;
                case "trivana":
                    // Refresh the page
                    location.reload();
                    break;
                case "explore":
                    // Scroll to the dataset explorer section
                    exploreSection.scrollIntoView({
                        behavior: "smooth"
                    });
                    break;
                case "about":
                    // Scroll to the about section
                    aboutSection.scrollIntoView({
                        behavior: "smooth"
                    });
                    break;
                case "contact":
                    // Scroll to the footer/contact section
                    contactSection.scrollIntoView({
                        behavior: "smooth"
                    });
                    break;
                default:
                    // Fallback for any other links
                    console.log(`No action defined for: ${linkText}`);
            }
        });
    });
    
    selectFileBtn.addEventListener("click", () => {
        // ...trigger the click event on the hidden file input.
        fileInput.click();
    });
});
