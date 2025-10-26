// Upload Page JavaScript
class UploadManager {
    constructor() {
        this.files = [];
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('filePreview');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    handleFiles(fileList) {
        const newFiles = Array.from(fileList).filter(file => 
            file.type.startsWith('image/') || 
            file.type === 'application/pdf' ||
            file.type === 'application/postscript'
        );

        this.files = [...this.files, ...newFiles];
        this.updatePreview();
    }

    updatePreview() {
        this.previewContainer.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const preview = this.createFilePreview(file, index);
            this.previewContainer.appendChild(preview);
        });
    }

    createFilePreview(file, index) {
        const div = document.createElement('div');
        div.className = 'file-preview-card';
        
        let previewContent = '';
        if (file.type.startsWith('image/')) {
            previewContent = `<img src="${URL.createObjectURL(file)}" class="preview-image" alt="${file.name}">`;
        } else {
            previewContent = `<div class="file-icon"><i class="fas fa-file-pdf"></i></div>`;
        }
        
        div.innerHTML = `
            ${previewContent}
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${graphicoApp.formatFileSize(file.size)}</div>
            </div>
            <button class="remove-file" onclick="uploadManager.removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return div;
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updatePreview();
    }

    async submitPrintJob(formData) {
        try {
            // Add files to FormData
            this.files.forEach(file => {
                formData.append('designFiles', file);
            });

            const response = await graphicoApp.apiCall('/upload-print', {
                method: 'POST',
                body: formData
            });

            graphicoApp.showNotification('Print job submitted successfully!', 'success');
            return response;
        } catch (error) {
            graphicoApp.showNotification('Error submitting print job', 'error');
            throw error;
        }
    }
}

// Initialize upload manager
const uploadManager = new UploadManager();
