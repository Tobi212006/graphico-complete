const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Create directories
const directories = ["uploads", "temp"];
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Enhanced file upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
        cb(null, "design-" + uniqueSuffix + "-" + safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg", "image/jpg", "image/png", "image/gif", 
        "image/webp", "application/pdf"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Supported: JPG, PNG, GIF, WebP, PDF"), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 5 // Max 5 files
    },
    fileFilter: fileFilter
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI environment variable. Configure it before starting the server.");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
});

// Enhanced Database Schemas
const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    service: { type: String, required: true },
    budget: String,
    deadline: String,
    message: String,
    status: { type: String, default: "pending" },
    source: { type: String, default: "website" },
    createdAt: { type: Date, default: Date.now }
});

const printJobSchema = new mongoose.Schema({
    jobNumber: { type: String, unique: true },
    printType: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    company: String,
    deliveryAddress: { type: String, required: true },
    quantity: { type: Number, required: true },
    dimensions: {
        width: String,
        height: String,
        unit: { type: String, default: "mm" }
    },
    printingOptions: {
        paperType: String,
        paperWeight: String,
        printQuality: String,
        finishing: [String],
        colorMode: { type: String, default: "full-color" },
        specialInstructions: String
    },
    files: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimetype: String,
        thumbnail: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    pricing: {
        basePrice: Number,
        quantityPrice: Number,
        finishingPrice: Number,
        totalPrice: Number,
        currency: { type: String, default: "INR" }
    },
    status: { type: String, default: "pending_review" },
    priority: { type: String, default: "normal" },
    estimatedDelivery: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    subject: String,
    message: { type: String, required: true },
    type: { type: String, default: "general" },
    status: { type: String, default: "new" },
    createdAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model("Quote", quoteSchema);
const PrintJob = mongoose.model("PrintJob", printJobSchema);
const Contact = mongoose.model("Contact", contactSchema);

// Generate unique job number
function generateJobNumber() {
    const prefix = "GRP";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}${timestamp}${random}`;
}

// Utility function to create thumbnails (simplified)
function createThumbnailPath(filePath) {
    return filePath; // In production, you'd use sharp or imagemagick
}

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "Graphico Server is running!",
        database: "MongoDB Connected",
        uploads: "Ready",
        timestamp: new Date().toISOString()
    });
});

// Get printing options and pricing
app.get("/api/printing-options", (req, res) => {
    const options = {
        paperTypes: [
            { value: "glossy", label: "Glossy Paper", description: "Shiny finish, vibrant colors" },
            { value: "matte", label: "Matte Paper", description: "Non-reflective, professional look" },
            { value: "cardstock", label: "Cardstock", description: "Heavy weight, premium feel" },
            { value: "recycled", label: "Recycled Paper", description: "Eco-friendly option" },
            { value: "photo", label: "Photo Paper", description: "High-quality for images" }
        ],
        printQualities: [
            { value: "standard", label: "Standard (300 DPI)", description: "Good for text and basic graphics" },
            { value: "high", label: "High (600 DPI)", description: "Excellent for photos and detailed graphics" },
            { value: "premium", label: "Premium (1200 DPI)", description: "Ultra-high for professional prints" }
        ],
        finishingOptions: [
            { value: "none", label: "No Finishing", description: "Basic print only" },
            { value: "lamination", label: "Lamination", description: "Protective coating" },
            { value: "spot-uv", label: "Spot UV", description: "Glossy highlights" },
            { value: "foil-stamping", label: "Foil Stamping", description: "Metallic effects" },
            { value: "embossing", label: "Embossing", description: "Raised texture" },
            { value: "die-cutting", label: "Die Cutting", description: "Custom shapes" }
        ],
        basePrices: {
            "business-cards": { base: 800, per100: 500 },
            "brochures": { base: 1500, per100: 800 },
            "posters": { base: 2500, per100: 1200 },
            "labels": { base: 500, per100: 200 },
            "packaging": { base: 3000, per100: 1500 },
            "photo": { base: 200, per100: 100 },
            "custom": { base: 1000, per100: 500 }
        }
    };
    res.json({ success: true, data: options });
});

// Submit quote request
app.post("/api/quotes", async (req, res) => {
    try {
        const { name, email, phone, company, service, budget, deadline, message } = req.body;
        
        const newQuote = new Quote({ 
            name, email, phone, company, service, budget, deadline, message 
        });
        
        await newQuote.save();
        
        res.json({ 
            success: true, 
            message: "Quote request submitted successfully! We will contact you within 24 hours.",
            data: {
                quoteId: newQuote._id,
                name: newQuote.name,
                service: newQuote.service,
                estimatedResponse: "24 hours"
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error submitting quote request",
            error: error.message 
        });
    }
});

// File upload for printing - MAIN ENDPOINT
app.post("/api/upload-print", upload.array("designFiles", 5), async (req, res) => {
    try {
        console.log("Upload request received. Files:", req.files ? req.files.length : 0);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload at least one design file" 
            });
        }

        // Validate required fields
        const required = ["printType", "customerName", "customerEmail", "deliveryAddress", "quantity"];
        const missing = required.filter(field => !req.body[field]);
        
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`
            });
        }

        // Generate job number
        const jobNumber = generateJobNumber();

        // Calculate pricing
        const basePrices = {
            "business-cards": { base: 800, per100: 500 },
            "brochures": { base: 1500, per100: 800 },
            "posters": { base: 2500, per100: 1200 },
            "labels": { base: 500, per100: 200 },
            "packaging": { base: 3000, per100: 1500 },
            "photo": { base: 200, per100: 100 },
            "custom": { base: 1000, per100: 500 }
        };

        const printConfig = basePrices[req.body.printType] || basePrices.custom;
        const quantity = parseInt(req.body.quantity) || 100;
        const basePrice = printConfig.base;
        const quantityPrice = Math.floor((quantity / 100) * printConfig.per100);
        const finishingPrice = req.body.finishing ? (Array.isArray(req.body.finishing) ? req.body.finishing.length : 1) * 200 : 0;
        const totalPrice = basePrice + quantityPrice + finishingPrice;

        // Prepare file information
        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            thumbnail: createThumbnailPath(file.path)
        }));

        // Calculate delivery date (3-5 business days)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);

        // Create new print job
        const printJob = new PrintJob({
            jobNumber,
            printType: req.body.printType,
            customerName: req.body.customerName,
            customerEmail: req.body.customerEmail,
            customerPhone: req.body.customerPhone,
            company: req.body.company,
            deliveryAddress: req.body.deliveryAddress,
            quantity: quantity,
            dimensions: {
                width: req.body.width,
                height: req.body.height,
                unit: req.body.unit || "mm"
            },
            printingOptions: {
                paperType: req.body.paperType,
                paperWeight: req.body.paperWeight,
                printQuality: req.body.printQuality,
                finishing: Array.isArray(req.body.finishing) ? req.body.finishing : [req.body.finishing].filter(Boolean),
                colorMode: req.body.colorMode || "full-color",
                specialInstructions: req.body.specialInstructions
            },
            files: files,
            pricing: {
                basePrice,
                quantityPrice,
                finishingPrice,
                totalPrice,
                currency: "INR"
            },
            estimatedDelivery: deliveryDate,
            notes: req.body.notes
        });

        await printJob.save();

        res.json({
            success: true,
            message: "Print job submitted successfully! Our team will review your files and contact you within 2 hours.",
            data: {
                jobNumber: printJob.jobNumber,
                printType: printJob.printType,
                totalPrice: printJob.pricing.totalPrice,
                currency: printJob.pricing.currency,
                filesCount: printJob.files.length,
                quantity: printJob.quantity,
                estimatedDelivery: printJob.estimatedDelivery.toDateString(),
                nextSteps: [
                    "Our design team will review your files",
                    "We'll contact you for any clarifications",
                    "You'll receive final confirmation before printing",
                    "Track your order status online"
                ]
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        
        if (error.code === 11000) {
            // Duplicate job number (very rare)
            return res.status(500).json({
                success: false,
                message: "System error. Please try again.",
                error: "Duplicate job number"
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error processing your print job",
            error: error.message 
        });
    }
});

// Contact form submission
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, phone, company, subject, message, type } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required fields"
            });
        }

        const contact = new Contact({
            name, email, phone, company, subject, message, type
        });

        await contact.save();

        res.json({
            success: true,
            message: "Thank you for your message! We will get back to you within 24 hours.",
            data: {
                contactId: contact._id,
                name: contact.name,
                responseTime: "24 hours"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error submitting contact form",
            error: error.message
        });
    }
});

// Serve uploaded files
app.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ success: false, message: "File not found" });
    }
});

// Get dashboard statistics
app.get("/api/dashboard/stats", async (req, res) => {
    try {
        const totalQuotes = await Quote.countDocuments();
        const totalPrintJobs = await PrintJob.countDocuments();
        const totalContacts = await Contact.countDocuments();
        const pendingJobs = await PrintJob.countDocuments({ status: "pending_review" });

        res.json({
            success: true,
            data: {
                totalQuotes,
                totalPrintJobs,
                totalContacts,
                pendingJobs,
                systemStatus: "Operational"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling for file uploads
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 25MB."
            });
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum is 5 files."
            });
        }
    }
    
    if (error.message.includes("Invalid file type")) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("🚀 GRAPHICO SERVER STARTED on http://localhost:" + PORT);
    console.log("📁 Upload directory: " + path.join(__dirname, "uploads"));
    console.log("💾 File uploads ready - Max 25MB, 5 files");
    console.log("📊 MongoDB: Connected");
    console.log("🛠️  System: Operational");
});
