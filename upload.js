    // Professional Upload & Print System
class GraphicoUploadSystem {
    constructor() {
        this.uploadedFiles = [];
        this.currentPricing = {
            basePrice: 0,
            quantityPrice: 0,
            finishingPrice: 0,
            totalPrice: 0
        };
        this.printingOptions = null;
    }

    init() {
        this.initializeUploadArea();
        this.initializeEventListeners();
        this.loadPrintingOptions();
        console.log("🚀 Graphico Upload System Initialized");
    }

    initializeUploadArea() {
        this.uploadArea = document.getElementById("uploadArea");
        this.fileInput = document.getElementById("fileInput");
        this.uploadForm = document.getElementById("uploadForm");
        this.filePreviewContainer = document.getElementById("filePreviewContainer");
        this.progressBar = document.getElementById("progressBar");
        this.progressText = document.getElementById("progressText");

        if (!this.uploadArea || !this.fileInput) {
            console.error("Upload elements not found");
            return;
        }

        // Click to upload
        this.uploadArea.addEventListener("click", () => {
            this.fileInput.click();
        });

        // File selection handler
        this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

        // Drag and drop setup
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const dragEvents = ["dragenter", "dragover", "dragleave", "drop"];
        
        dragEvents.forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.highlight(), false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.unhighlight(), false);
        });

        this.uploadArea.addEventListener("drop", (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.uploadArea.classList.add("dragover");
    }

    unhighlight() {
        this.uploadArea.classList.remove("dragover");
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.fileInput.files = files;
        this.handleFileSelect({ target: { files: files } });
    }

    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showMessage("Please upload valid file types: JPG, PNG, GIF, WebP, or PDF", "error");
            return;
        }

        // Update uploaded files
        this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
        
        // Update UI
        this.updateUploadArea();
        this.renderFilePreviews();
        this.showPrintingOptions();
        
        this.showMessage(`Added ${validFiles.length} file(s) successfully!`, "success");
    }

    validateFile(file) {
        const validTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/webp", "application/pdf"
        ];
        
        const maxSize = 25 * 1024 * 1024; // 25MB

        if (!validTypes.includes(file.type)) {
            console.error(`Invalid file type: ${file.type}`);
            return false;
        }

        if (file.size > maxSize) {
            console.error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return false;
        }

        return true;
    }

    updateUploadArea() {
        if (this.uploadedFiles.length === 0) {
            this.uploadArea.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="upload-text">
                    <h4>Upload Your Design Files</h4>
                    <p>Click to browse or drag and drop your files here</p>
                    <p class="text-small">Supported: JPG, PNG, PDF (Max: 25MB)</p>
                </div>
            `;
            this.uploadArea.classList.remove("active");
        } else {
            this.uploadArea.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="upload-text">
                    <h4>${this.uploadedFiles.length} File(s) Ready</h4>
                    <p>Click to add more files or drag and drop</p>
                    <p class="text-small">${this.getTotalFileSize()} total</p>
                </div>
            `;
            this.uploadArea.classList.add("active");
        }
    }

    getTotalFileSize() {
        const totalBytes = this.uploadedFiles.reduce((sum, file) => sum + file.size, 0);
        return this.formatFileSize(totalBytes);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    renderFilePreviews() {
        if (!this.filePreviewContainer) return;

        if (this.uploadedFiles.length === 0) {
            this.filePreviewContainer.style.display = "none";
            return;
        }

        this.filePreviewContainer.style.display = "block";
        
        const previewsHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-preview-card" data-file-index="${index}">
                <button type="button" class="remove-file" onclick="uploadSystem.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
                ${file.type.startsWith("image/") ? 
                    `<img src="${URL.createObjectURL(file)}" alt="${file.name}" class="preview-image">` :
                    `<div class="preview-image">
                        <i class="fas fa-file-pdf" style="font-size: 3rem; color: #2563eb;"></i>
                    </div>`
                }
                <div class="file-info">
                    <div class="file-name">${this.truncateFileName(file.name)}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `).join("");

        this.filePreviewContainer.innerHTML = `
            <h4><i class="fas fa-images"></i> Uploaded Files (${this.uploadedFiles.length})</h4>
            <div class="file-preview-grid">
                ${previewsHTML}
            </div>
        `;
    }

    truncateFileName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + "...";
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.updateUploadArea();
        this.renderFilePreviews();
        
        if (this.uploadedFiles.length === 0) {
            this.hidePrintingOptions();
        }
    }

    clearAllFiles() {
        this.uploadedFiles = [];
        this.fileInput.value = "";
        this.updateUploadArea();
        this.renderFilePreviews();
        this.hidePrintingOptions();
    }

    showPrintingOptions() {
        const printingOptions = document.getElementById("printingOptions");
        if (printingOptions) {
            printingOptions.style.display = "block";
            printingOptions.style.animation = "slideIn 0.5s ease";
        }
        this.updatePriceCalculator();
    }

    hidePrintingOptions() {
        const printingOptions = document.getElementById("printingOptions");
        if (printingOptions) {
            printingOptions.style.display = "none";
        }
    }

    initializeEventListeners() {
        // Form submission
        if (this.uploadForm) {
            this.uploadForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
        }

        // Real-time price calculation
        this.setupPriceCalculation();

        // Quantity changes
        const quantityInput = document.getElementById("quantity");
        if (quantityInput) {
            quantityInput.addEventListener("input", () => this.updatePriceCalculator());
        }
    }

    setupPriceCalculation() {
        const optionCards = document.querySelectorAll(".option-card");
        optionCards.forEach(card => {
            card.addEventListener("click", (e) => {
                this.selectOption(card);
                this.updatePriceCalculator();
            });
        });
    }

    selectOption(element) {
        const parent = element.parentElement;
        const groupName = parent.getAttribute("data-option-group");
        
        if (groupName === "finishing") {
            // Multiple selection for finishing options
            element.classList.toggle("selected");
        } else {
            // Single selection for other options
            parent.querySelectorAll(".option-card").forEach(card => {
                card.classList.remove("selected");
            });
            element.classList.add("selected");
        }
    }

    async loadPrintingOptions() {
        try {
            const response = await fetch("/api/printing-options");
            const result = await response.json();
            
            if (result.success) {
                this.printingOptions = result.data;
                this.populatePrintingOptions();
            }
        } catch (error) {
            console.error("Failed to load printing options:", error);
        }
    }

    populatePrintingOptions() {
        if (!this.printingOptions) return;

        // Populate paper types
        const paperGrid = document.querySelector('[data-option-group="paperType"]');
        if (paperGrid) {
            paperGrid.innerHTML = this.printingOptions.paperTypes.map(paper => `
                <div class="option-card" data-value="${paper.value}" data-price="0">
                    <h5>${paper.label}</h5>
                    <p>${paper.description}</p>
                </div>
            `).join("");
        }

        // Populate print qualities
        const qualityGrid = document.querySelector('[data-option-group="printQuality"]');
        if (qualityGrid) {
            qualityGrid.innerHTML = this.printingOptions.printQualities.map(quality => `
                <div class="option-card" data-value="${quality.value}" data-price="0">
                    <h5>${quality.label}</h5>
                    <p>${quality.description}</p>
                </div>
            `).join("");
        }

        // Populate finishing options
        const finishingGrid = document.querySelector('[data-option-group="finishing"]');
        if (finishingGrid) {
            finishingGrid.innerHTML = this.printingOptions.finishingOptions.map(finish => `
                <div class="option-card" data-value="${finish.value}" data-price="200">
                    <h5>${finish.label}</h5>
                    <p>${finish.description}</p>
                    <div class="option-price">+ ₹200</div>
                </div>
            `).join("");
        }

        // Re-attach event listeners
        this.setupPriceCalculation();
    }

    updatePriceCalculator() {
        const printType = document.getElementById("printType")?.value;
        const quantity = parseInt(document.getElementById("quantity")?.value) || 100;

        if (!printType || !this.printingOptions) return;

        const baseConfig = this.printingOptions.basePrices[printType] || this.printingOptions.basePrices.custom;
        
        // Calculate base price
        this.currentPricing.basePrice = baseConfig.base;
        this.currentPricing.quantityPrice = Math.floor((quantity / 100) * baseConfig.per100);
        
        // Calculate finishing price
        const selectedFinishing = document.querySelectorAll('[data-option-group="finishing"] .option-card.selected');
        this.currentPricing.finishingPrice = selectedFinishing.length * 200;
        
        // Total price
        this.currentPricing.totalPrice = 
            this.currentPricing.basePrice + 
            this.currentPricing.quantityPrice + 
            this.currentPricing.finishingPrice;

        // Update UI
        this.renderPriceBreakdown();
    }

    renderPriceBreakdown() {
        const priceCalculator = document.getElementById("priceCalculator");
        if (!priceCalculator) return;

        priceCalculator.innerHTML = `
            <h4><i class="fas fa-calculator"></i> Price Estimate</h4>
            <div class="price-breakdown">
                <div class="price-item">
                    <span>Base Price:</span>
                    <span>₹${this.currentPricing.basePrice}</span>
                </div>
                <div class="price-item">
                    <span>Quantity (${document.getElementById("quantity")?.value || 100}):</span>
                    <span>₹${this.currentPricing.quantityPrice}</span>
                </div>
                <div class="price-item">
                    <span>Finishing:</span>
                    <span>₹${this.currentPricing.finishingPrice}</span>
                </div>
                <div class="price-item price-total">
                    <span>Total Estimated Price:</span>
                    <span>₹${this.currentPricing.totalPrice}</span>
                </div>
            </div>
        `;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.uploadedFiles.length === 0) {
            this.showMessage("Please upload at least one design file", "error");
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Your Order...';
            submitBtn.disabled = true;
            this.showProgress(0);

            // Create FormData
            const formData = new FormData();
            
            // Add files
            this.uploadedFiles.forEach(file => {
                formData.append("designFiles", file);
            });

            // Add form data
            const formElements = event.target.elements;
            for (let element of formElements) {
                if (element.name && element.value) {
                    if (element.type === "checkbox" || element.type === "radio") {
                        if (element.checked) {
                            formData.append(element.name, element.value);
                        }
                    } else {
                        formData.append(element.name, element.value);
                    }
                }
            }

            // Add selected options
            this.addSelectedOptionsToFormData(formData);

            // Simulate upload progress
            this.simulateUploadProgress();

            // Send to server
            const response = await fetch("/api/upload-print", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, "success");
                this.showOrderConfirmation(result.data);
                this.clearAllFiles();
                event.target.reset();
            } else {
                this.showMessage(result.message || "Upload failed", "error");
            }

        } catch (error) {
            console.error("Upload error:", error);
            this.showMessage("Error submitting print job: " + error.message, "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            this.hideProgress();
        }
    }

    addSelectedOptionsToFormData(formData) {
        // Add selected paper type
        const selectedPaper = document.querySelector('[data-option-group="paperType"] .option-card.selected');
        if (selectedPaper) {
            formData.append("paperType", selectedPaper.getAttribute("data-value"));
        }

        // Add selected print quality
        const selectedQuality = document.querySelector('[data-option-group="printQuality"] .option-card.selected');
        if (selectedQuality) {
            formData.append("printQuality", selectedQuality.getAttribute("data-value"));
        }

        // Add selected finishing options
        const selectedFinishing = document.querySelectorAll('[data-option-group="finishing"] .option-card.selected');
        selectedFinishing.forEach(finish => {
            formData.append("finishing", finish.getAttribute("data-value"));
        });
    }

    simulateUploadProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) {
                clearInterval(interval);
                this.showProgress(90);
            } else {
                this.showProgress(progress);
            }
        }, 200);
    }

    showProgress(percent) {
        if (this.progressBar) {
            this.progressBar.style.width = percent + "%";
        }
        if (this.progressText) {
            this.progressText.textContent = `Uploading... ${Math.round(percent)}%`;
            this.progressText.style.display = "block";
        }
    }

    hideProgress() {
        if (this.progressBar) {
            this.progressBar.style.width = "0%";
        }
        if (this.progressText) {
            this.progressText.style.display = "none";
        }
    }

    showMessage(message, type = "info") {
        // Remove existing messages
        const existingMessages = document.querySelectorAll(".alert-message");
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement("div");
        messageDiv.className = `alert-message ${type}-message`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="close-message">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        const uploadSection = document.getElementById("upload");
        if (uploadSection) {
            uploadSection.insertBefore(messageDiv, uploadSection.firstChild);
        }

        // Auto-remove success messages after 5 seconds
        if (type === "success") {
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    showOrderConfirmation(orderData) {
        const confirmationHTML = `
            <div class="success-message">
                <h4><i class="fas fa-check-circle"></i> Order Submitted Successfully!</h4>
                <div class="order-details">
                    <p><strong>Job Number:</strong> ${orderData.jobNumber}</p>
                    <p><strong>Total Price:</strong> ₹${orderData.totalPrice}</p>
                    <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
                    <p><strong>Files Uploaded:</strong> ${orderData.filesCount}</p>
                </div>
                <div class="next-steps">
                    <h5>What happens next:</h5>
                    <ul>
                        ${orderData.nextSteps ? orderData.nextSteps.map(step => `<li>${step}</li>`).join("") : ""}
                    </ul>
                </div>
            </div>
        `;

        const uploadForm = document.getElementById("uploadForm");
        if (uploadForm) {
            uploadForm.insertAdjacentHTML("beforebegin", confirmationHTML);
        }
    }
}

// Initialize the upload system
const uploadSystem = new GraphicoUploadSystem();

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    uploadSystem.init();
});

// Global functions for HTML onclick handlers
function removeFile(index) {
    uploadSystem.removeFile(index);
}

function selectOption(element) {
    uploadSystem.selectOption(element);
}

function clearAllFiles() {
    uploadSystem.clearAllFiles();
}
