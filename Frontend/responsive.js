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

    selectFileBtn.addEventListener("click", () => {
        // ...trigger the click event on the hidden file input.
        fileInput.click();
    });
});
