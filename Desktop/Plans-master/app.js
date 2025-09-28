console.log("Let's start the project");

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const { runQuery, getRow, getAll } = require('./config/database');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  authenticateToken, 
  storeRefreshToken, 
  revokeRefreshToken, 
  blacklistToken, 
  getDeviceInfo,
  verifyRefreshToken 
} = require('./middleware/auth');
const { handleUpload, uploadDir } = require('./middleware/upload');

// 1.Middleware kirish cide 
app.use(cors()); // Allow requests from any domain
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 2.Session
// 3. View code 
app.set("views", "views");
app.set("view engine", "ejs");

//4. Routing : Create item
app.post("/create-item", async (req, res) => {
    console.log("User entered /create-item");
    console.log(req.body);

    const new_reja = req.body.reja.trim();
    if (!new_reja) {
        return res.json({ error: "Cannot add empty item" });
    }

    try {
        const result = await runQuery(
            'INSERT INTO plans (reja) VALUES (?)',
            [new_reja]
        );
        res.json({ _id: result.id, reja: new_reja });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: "Database error" });
    }
});

// Delete item
app.post("/delete-item", async (req, res) => {
    const id = req.body.id;
    
    try {
        await runQuery(
            'DELETE FROM plans WHERE id = ?',
            [id]
        );
        res.json({ state: "success" });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: "Delete failed" });
    }
});

// Edit item
app.post("/edit-item", async (req, res) => {
    const { id, new_input } = req.body;

    try {
        await runQuery(
            'UPDATE plans SET reja = ? WHERE id = ?',
            [new_input.trim(), id]
        );
        res.json({ state: "success" });
    } catch (err) {
        console.error('Edit error:', err);
        res.status(500).json({ error: "Edit failed" });
    }
});

// Delete all
app.post("/remove-all", async (req, res) => {
    if (req.body.delete_all) {
        try {
            await runQuery('DELETE FROM plans');
            res.json({ state: "All plans are deleted" });
        } catch (err) {
            console.error('Delete-all error:', err);
            res.status(500).json({ error: "Delete-all failed" });
        }
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// Signup route
app.post("/signup", async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Validation
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        if (!email && !phone) {
            return res.status(400).json({ error: "Either email or phone is required" });
        }

        // Check if user already exists
        let existingUser = null;
        if (email) {
            existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
        }
        if (!existingUser && phone) {
            existingUser = await getRow('SELECT id FROM users WHERE phone = ?', [phone]);
        }

        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await runQuery(
            'INSERT INTO users (email, phone, password) VALUES (?, ?, ?)',
            [email || null, phone || null, hashedPassword]
        );

        const userId = result.id;
        const deviceInfo = getDeviceInfo(req);

        // Generate tokens
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId, deviceInfo);

        // Store refresh token
        await storeRefreshToken(userId, refreshToken, deviceInfo);

        res.status(201).json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: userId, email, phone }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signin route
app.post("/signin", async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        if (!email && !phone) {
            return res.status(400).json({ error: "Either email or phone is required" });
        }

        // Find user
        let user = null;
        if (email) {
            user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
        }
        if (!user && phone) {
            user = await getRow('SELECT * FROM users WHERE phone = ?', [phone]);
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const deviceInfo = getDeviceInfo(req);

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, deviceInfo);

        // Store refresh token
        await storeRefreshToken(user.id, refreshToken, deviceInfo);

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: user.id, email: user.email, phone: user.phone }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Refresh token route
app.post("/signin/new_token", async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refresh_token);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Check if refresh token exists and is not revoked
        const tokenRecord = await getRow(
            'SELECT * FROM refresh_tokens WHERE token = ? AND is_revoked = FALSE AND expires_at > datetime("now", "localtime")',
            [refresh_token]
        );

        if (!tokenRecord) {
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        // Get user
        const user = await getRow('SELECT id, email, phone FROM users WHERE id = ?', [decoded.userId]);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id, tokenRecord.device_info);

        // Revoke old refresh token
        await revokeRefreshToken(refresh_token);

        // Store new refresh token
        await storeRefreshToken(user.id, newRefreshToken, tokenRecord.device_info);

        res.json({
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User info route
app.get("/info", authenticateToken, (req, res) => {
    res.json({ user_id: req.user.id });
});

// Logout route
app.get("/logout", authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // Blacklist current access token
        await blacklistToken(token, req.user.id);

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ==================== FILE MANAGEMENT ROUTES ====================

// File upload route
app.post("/file/upload", authenticateToken, handleUpload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { originalname, filename, mimetype, size, path: filePath } = req.file;
        const extension = path.extname(originalname);

        // Store file metadata in database
        const result = await runQuery(
            'INSERT INTO files (user_id, filename, original_name, file_path, mime_type, file_size, extension) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, filename, originalname, filePath, mimetype, size, extension]
        );

        res.status(201).json({
            id: result.id,
            filename: originalname,
            size: size,
            mime_type: mimetype,
            extension: extension,
            created_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// File list route with pagination
app.get("/file/list", authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const list_size = parseInt(req.query.list_size) || 10;
        const offset = (page - 1) * list_size;

        // Get total count
        const countResult = await getRow(
            'SELECT COUNT(*) as total FROM files WHERE user_id = ?',
            [req.user.id]
        );
        const total = countResult.total;

        // Get files with pagination
        const files = await getAll(
            'SELECT id, original_name, mime_type, file_size, extension, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [req.user.id, list_size, offset]
        );

        res.json({
            files: files,
            pagination: {
                page: page,
                list_size: list_size,
                total: total,
                total_pages: Math.ceil(total / list_size)
            }
        });

    } catch (error) {
        console.error('File list error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get file information
app.get("/file/:id", authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;
        
        const file = await getRow(
            'SELECT id, original_name, mime_type, file_size, extension, created_at, updated_at FROM files WHERE id = ? AND user_id = ?',
            [fileId, req.user.id]
        );

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        res.json(file);

    } catch (error) {
        console.error('File info error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Download file
app.get("/file/download/:id", authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;
        
        const file = await getRow(
            'SELECT * FROM files WHERE id = ? AND user_id = ?',
            [fileId, req.user.id]
        );

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        const fs = require('fs');
        const path = require('path');

        // Check if file exists on disk
        if (!fs.existsSync(file.file_path)) {
            return res.status(404).json({ error: "File not found on disk" });
        }

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Type', file.mime_type);
        res.setHeader('Content-Length', file.file_size);

        // Stream the file
        const fileStream = fs.createReadStream(file.file_path);
        fileStream.pipe(res);

    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update file
app.put("/file/update/:id", authenticateToken, handleUpload, async (req, res) => {
    try {
        const fileId = req.params.id;
        
        // Check if file exists and belongs to user
        const existingFile = await getRow(
            'SELECT * FROM files WHERE id = ? AND user_id = ?',
            [fileId, req.user.id]
        );

        if (!existingFile) {
            return res.status(404).json({ error: "File not found" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { originalname, filename, mimetype, size, path: filePath } = req.file;
        const extension = path.extname(originalname);

        // Delete old file from disk
        const fs = require('fs');
        if (fs.existsSync(existingFile.file_path)) {
            fs.unlinkSync(existingFile.file_path);
        }

        // Update file metadata in database
        await runQuery(
            'UPDATE files SET filename = ?, original_name = ?, file_path = ?, mime_type = ?, file_size = ?, extension = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [filename, originalname, filePath, mimetype, size, extension, fileId]
        );

        res.json({
            id: fileId,
            filename: originalname,
            size: size,
            mime_type: mimetype,
            extension: extension,
            updated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('File update error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete file
app.delete("/file/delete/:id", authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;
        
        // Get file info
        const file = await getRow(
            'SELECT * FROM files WHERE id = ? AND user_id = ?',
            [fileId, req.user.id]
        );

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        // Delete file from disk
        const fs = require('fs');
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
        }

        // Delete file record from database
        await runQuery('DELETE FROM files WHERE id = ?', [fileId]);

        res.json({ message: "File deleted successfully" });

    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Author page (fix undefined `user`)
app.get("/author", (req, res) => {
    const user = { name: "Your Name", email: "your@email.com" }; // Replace with actual user info
    res.render("author", { user });
});

// Landing page
app.get("/", (req, res) => {
    res.render("landing");
});

// Authentication page
app.get("/auth", (req, res) => {
    res.render("index");
});

// Dashboard route
app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

// Legacy plans page (keeping for backward compatibility)
app.get("/plans", async (req, res) => {
    console.log("User entered /plans");

    try {
        const rows = await getAll('SELECT * FROM plans ORDER BY created_at DESC');
        res.render("reja", { items: rows });
    } catch (err) {
        console.error("Something went wrong:", err);
        res.status(500).send("Internal server error");
    }
});

// Export Express app
module.exports = app;
