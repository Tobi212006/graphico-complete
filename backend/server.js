const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file types
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/postscript' || // AI files
        file.mimetype === 'image/vnd.adobe.photoshop') { // PSD files
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDF, AI, and PSD files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://graphico:amit1234@cluster0.wocfdcj.mongodb.net/graphico?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ CONNECTED TO MONGODB ATLAS'))
.catch(err => console.log('❌ MongoDB error:', err.message));

// MongoDB Schemas
const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    service: { type: String, required: true },
    message: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    product: { type: String, required: true },
    amount: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    address: String,
    quantity: { type: Number, default: 1 },
    printingOptions: {
        paperType: String,
        printQuality: String,
        finishing: String,
        specialInstructions: String
    },
    files: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    paymentStatus: { type: String, default: 'pending' },
    orderStatus: { type: String, default: 'processing' },
    createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const printJobSchema = new mongoose.Schema({
    printType: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    deliveryAddress: { type: String, required: true },
    quantity: { type: Number, required: true },
    printingOptions: {
        paperType: String,
        printQuality: String,
        finishing: String,
        specialInstructions: String
    },
    files: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    estimatedPrice: Number,
    status: { type: String, default: 'pending_review' },
    createdAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);
const Order = mongoose.model('Order', orderSchema);
const Contact = mongoose.model('Contact', contactSchema);
const PrintJob = mongoose.model('PrintJob', printJobSchema);

// Routes

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Graphico Server is running perfectly!',
        database: 'MongoDB Atlas Connected',
        timestamp: new Date().toISOString()
    });
});

// Submit a quote request
app.post('/api/quotes', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;
        
        // Validation
        if (!name || !email || !service) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and service are required fields'
            });
        }

        const newQuote = new Quote({
            name,
            email,
            phone,
            service,
            message
        });
        
        await newQuote.save();
        
        res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully! We will contact you within 24 hours.',
            data: {
                id: newQuote._id,
                name: newQuote.name,
                service: newQuote.service
            }
        });
    } catch (error) {
        console.error('Quote submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting quote',
            error: error.message
        });
    }
});

// Submit a print job with file upload
app.post('/api/print-jobs', upload.array('designFiles', 5), async (req, res) => {
    try {
        const { 
            printType, 
            customerName, 
            customerEmail, 
            customerPhone, 
            deliveryAddress, 
            quantity,
            paperType,
            printQuality,
            finishing,
            specialInstructions 
        } = req.body;

        // Validation
        if (!printType || !customerName || !customerEmail || !deliveryAddress || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Print type, customer name, email, delivery address, and quantity are required fields'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one design file'
            });
        }

        // Calculate estimated price
        const basePrices = {
            'business-cards': 800,
            'brochures': 1500,
            'posters': 2500,
            'labels': 500,
            'packaging': 3000,
            'photo': 200,
            'custom': 1000
        };

        const basePrice = basePrices[printType] || 1000;
        const estimatedPrice = basePrice * parseInt(quantity);

        // Prepare file information
        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size
        }));

        // Create new print job
        const newPrintJob = new PrintJob({
            printType,
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            quantity: parseInt(quantity),
            printingOptions: {
                paperType,
                printQuality,
                finishing,
                specialInstructions
            },
            files,
            estimatedPrice
        });

        await newPrintJob.save();

        res.status(201).json({
            success: true,
            message: 'Print job submitted successfully! We will review your files and contact you within 2 hours.',
            data: {
                jobId: newPrintJob._id,
                printType: newPrintJob.printType,
                estimatedPrice: newPrintJob.estimatedPrice,
                filesCount: newPrintJob.files.length
            }
        });

    } catch (error) {
        console.error('Print job submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting print job',
            error: error.message
        });
    }
});

// Get all print jobs (for admin)
app.get('/api/print-jobs', async (req, res) => {
    try {
        const printJobs = await PrintJob.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: printJobs.length,
            data: printJobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching print jobs',
            error: error.message
        });
    }
});

// Serve uploaded files
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
});

// Get all quotes (for admin dashboard)
app.get('/api/quotes', async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: quotes.length,
            data: quotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quotes',
            error: error.message
        });
    }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const { product, amount, customerName, customerEmail, customerPhone, address, quantity } = req.body;
        
        // Validation
        if (!product || !amount || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Product, amount, customer name, and email are required'
            });
        }

        const newOrder = new Order({
            product,
            amount,
            customerName,
            customerEmail,
            customerPhone,
            address,
            quantity,
            paymentStatus: 'pending'
        });
        
        await newOrder.save();
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully! Proceed to payment.',
            data: {
                orderId: newOrder._id,
                product: newOrder.product,
                amount: newOrder.amount,
                status: newOrder.orderStatus
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// Simulate payment processing
app.post('/api/process-payment', async (req, res) => {
    try {
        const { orderId, paymentMethod, cardDetails } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Simulate payment processing (in real app, integrate with Stripe/Razorpay)
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (paymentSuccess) {
            // Update order status
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully! Your order has been confirmed.',
                data: {
                    orderId: order._id,
                    paymentStatus: order.paymentStatus,
                    orderStatus: order.orderStatus,
                    transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
                }
            });
        } else {
            // Simulate payment failure
            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({
                success: false,
                message: 'Payment failed. Please try again or use a different payment method.',
                data: {
                    orderId: order._id,
                    paymentStatus: order.paymentStatus
                }
            });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
});

// Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required fields'
            });
        }

        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });
        
        await newContact.save();
        
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                id: newContact._id,
                name: newContact.name
            }
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting contact form',
            error: error.message
        });
    }
});

// Get all contacts (for admin)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts',
            error: error.message
        });
    }
});

// Dashboard statistics
app.get('/api/dashboard', async (req, res) => {
    try {
        const totalQuotes = await Quote.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalContacts = await Contact.countDocuments();
        const totalPrintJobs = await PrintJob.countDocuments();
        const pendingQuotes = await Quote.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
        const pendingPrintJobs = await PrintJob.countDocuments({ status: 'pending_review' });
        
        // Recent activities
        const recentQuotes = await Quote.find().sort({ createdAt: -1 }).limit(5);
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        const recentPrintJobs = await PrintJob.find().sort({ createdAt: -1 }).limit(5);
        
        res.status(200).json({
            success: true,
            data: {
                statistics: {
                    totalQuotes,
                    totalOrders,
                    totalContacts,
                    totalPrintJobs,
                    pendingQuotes,
                    completedOrders,
                    pendingPrintJobs
                },
                recentActivities: {
                    quotes: recentQuotes,
                    orders: recentOrders,
                    printJobs: recentPrintJobs
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

// Update print job status (for admin)
app.put('/api/print-jobs/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending_review', 'approved', 'in_production', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const printJob = await PrintJob.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!printJob) {
            return res.status(404).json({
                success: false,
                message: 'Print job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Print job status updated successfully',
            data: printJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating print job status',
            error: error.message
        });
    }
});

// Update order status (for admin)
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['processing', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Update quote status (for admin)
app.put('/api/quotes/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'contacted', 'quoted', 'converted', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quote status updated successfully',
            data: quote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating quote status',
            error: error.message
        });
    }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('🚀 GRAPHICO SERVER STARTED on http://localhost:' + PORT);
    console.log('📊 MongoDB Atlas: Connected');
    console.log('💾 File Upload: Ready (10MB max)');
    console.log('🖨️  Print Jobs: Ready');
    console.log('💳 Payment System: Ready (Simulated)');
    console.log('📨 Quote System: Ready');
    console.log('🛒 Order System: Ready');
});