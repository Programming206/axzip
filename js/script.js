document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const originalSizeDisplay = document.getElementById('originalSizeDisplay');
    const targetSizeInput = document.getElementById('targetSize');
    const compressBtn = document.getElementById('compressBtn');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLink = document.getElementById('downloadLink');
    const compressedSizeDisplay = document.getElementById('compressedSizeDisplay');
    const processingSection = document.getElementById('processingSection');
    const downloadSection = document.getElementById('downloadSection');
    let uploadedFile = null; // To store the file object

    // Helper to format file size
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Helper to display status messages
    const showStatus = (message, type = 'info') => {
        statusMessage.textContent = message;
        statusMessage.className = `status-message show ${type}`;
    };

    const clearStatus = () => {
        statusMessage.className = 'status-message'; // Hides it by removing 'show'
        statusMessage.textContent = '';
    };

    // Handle file selection via input
    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            uploadedFile = event.target.files[0];
            handleFile(uploadedFile);
        }
    });

    // Handle drag and drop
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    uploadArea.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (event.dataTransfer.files.length > 0) {
            uploadedFile = event.dataTransfer.files[0];
            handleFile(uploadedFile);
        }
    });

    const handleFile = (file) => {
        clearStatus();
        downloadSection.style.display = 'none';
        downloadLink.style.display = 'none';
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showStatus('فقط فایل‌های JPG و PNG پشتیبانی می‌شوند.', 'error');
            processingSection.style.display = 'none';
            uploadedFile = null;
            return;
        }
        fileNameDisplay.textContent = `نام فایل: ${file.name}`;
        originalSizeDisplay.textContent = `حجم اصلی: ${formatBytes(file.size)}`;
        processingSection.style.display = 'block';
        showStatus('فایل آماده فشرده‌سازی است. حجم هدف را وارد کنید.', 'info');
    };

    // Compression logic
    compressBtn.addEventListener('click', async () => {
        if (!uploadedFile) {
            showStatus('لطفاً ابتدا یک تصویر را انتخاب یا آپلود کنید.', 'error');
            return;
        }
        const targetSizeKB = parseInt(targetSizeInput.value, 10);
        if (isNaN(targetSizeKB) || targetSizeKB <= 0) {
            showStatus('لطفاً یک حجم هدف معتبر (عدد مثبت) وارد کنید.', 'error');
            return;
        }
        showStatus('در حال فشرده‌سازی تصویر...', 'info');
        compressBtn.disabled = true; // Disable button during compression
        downloadLink.style.display = 'none';
        downloadSection.style.display = 'none';
        try {
            const options = {
                maxSizeMB: targetSizeKB / 1024, // Convert KB to MB
                maxWidthOrHeight: 1920, // Max dimension, adjust as needed
                useWebWorker: true, // Corrected key for using web worker
                initialQuality: 0.9, // Starting quality, will be adjusted by the library
                alwaysKeepResolution: false, // Allow resolution to change if needed for target size
            };
            // Using browser-image-compression library
            const compressedFile = await imageCompression(uploadedFile, options);
            // Create a download link for the compressed file
            const downloadUrl = URL.createObjectURL(compressedFile);
            downloadLink.href = downloadUrl;
            downloadLink.download = `compressed_${uploadedFile.name}`;
            compressedSizeDisplay.textContent = `حجم فشرده شده: ${formatBytes(compressedFile.size)}`;
            downloadLink.style.display = 'inline-flex';
            downloadSection.style.display = 'flex'; // Show download section
            showStatus('تصویر با موفقیت فشرده شد!', 'success');
            // Clean up the URL object after a short delay (or on page unload)
            // URL.revokeObjectURL(downloadUrl); // This can be called after user downloads or navigates away
        } catch (error) {
            console.error('Compression failed:', error);
            showStatus(`خطا در فشرده‌سازی: ${error.message}`, 'error');
            downloadSection.style.display = 'none';
        } finally {
            compressBtn.disabled = false; // Re-enable button
        }
    });
});