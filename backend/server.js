const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage path
const DATA_DIR = path.join(__dirname, 'data');
const URLS_FILE = path.join(DATA_DIR, 'urls.json');
const CHECKS_FILE = path.join(DATA_DIR, 'checks.json');

// Initialize data directory and files
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize URLs file if it doesn't exist
    try {
      await fs.access(URLS_FILE);
    } catch {
      await fs.writeFile(URLS_FILE, JSON.stringify([]));
    }
    
    // Initialize checks file if it doesn't exist
    try {
      await fs.access(CHECKS_FILE);
    } catch {
      await fs.writeFile(CHECKS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions
async function readUrls() {
  try {
    const data = await fs.readFile(URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUrls(urls) {
  await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

async function readChecks() {
  try {
    const data = await fs.readFile(CHECKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeChecks(checks) {
  await fs.writeFile(CHECKS_FILE, JSON.stringify(checks, null, 2));
}

// URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Check URL health
async function checkUrlHealth(url) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Accept any status code less than 500
      }
    });
    
    const responseTime = Date.now() - startTime;
    const isHealthy = response.status >= 200 && response.status < 400;
    
    return {
      url,
      status: isHealthy ? 'UP' : 'DOWN',
      responseTime,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      status: 'DOWN',
      responseTime,
      statusCode: null,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

// API Routes

// Get all URLs
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await readUrls();
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read URLs' });
  }
});

// Add URLs
app.post('/api/urls', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs must be an array' });
    }
    
    const validUrls = urls.filter(url => isValidUrl(url));
    const invalidUrls = urls.filter(url => !isValidUrl(url));
    
    if (invalidUrls.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid URLs found', 
        invalidUrls 
      });
    }
    
    const existingUrls = await readUrls();
    const newUrls = [...new Set([...existingUrls, ...validUrls])]; // Remove duplicates
    
    await writeUrls(newUrls);
    res.json({ message: 'URLs added successfully', urls: newUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add URLs' });
  }
});

// Delete URL
app.delete('/api/urls/:url', async (req, res) => {
  try {
    const urlToDelete = decodeURIComponent(req.params.url);
    const urls = await readUrls();
    const updatedUrls = urls.filter(url => url !== urlToDelete);
    
    await writeUrls(updatedUrls);
    res.json({ message: 'URL deleted successfully', urls: updatedUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

// Check single URL
app.post('/api/check-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    const result = await checkUrlHealth(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check URL' });
  }
});

// Check all URLs
app.post('/api/check-all', async (req, res) => {
  try {
    const urls = await readUrls();
    
    if (urls.length === 0) {
      return res.json([]);
    }
    
    const results = await Promise.all(
      urls.map(url => checkUrlHealth(url))
    );
    
    // Store results
    const existingChecks = await readChecks();
    const newChecks = [...existingChecks, ...results];
    
    // Keep only last 1000 checks to prevent file from growing too large
    const limitedChecks = newChecks.slice(-1000);
    await writeChecks(limitedChecks);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check URLs' });
  }
});

// Get check history
app.get('/api/history', async (req, res) => {
  try {
    const checks = await readChecks();
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read check history' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const checks = await readChecks();
    const urls = await readUrls();
    
    const stats = {};
    
    urls.forEach(url => {
      const urlChecks = checks.filter(check => check.url === url);
      const upCount = urlChecks.filter(check => check.status === 'UP').length;
      const totalChecks = urlChecks.length;
      const avgResponseTime = totalChecks > 0 
        ? urlChecks.reduce((sum, check) => sum + check.responseTime, 0) / totalChecks 
        : 0;
      
      stats[url] = {
        uptime: totalChecks > 0 ? (upCount / totalChecks * 100).toFixed(2) : 0,
        totalChecks,
        avgResponseTime: Math.round(avgResponseTime),
        lastCheck: urlChecks.length > 0 ? urlChecks[urlChecks.length - 1] : null
      };
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Automatic health checks every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running automatic health checks...');
  try {
    const urls = await readUrls();
    
    if (urls.length > 0) {
      const results = await Promise.all(
        urls.map(url => checkUrlHealth(url))
      );
      
      const existingChecks = await readChecks();
      const newChecks = [...existingChecks, ...results];
      const limitedChecks = newChecks.slice(-1000);
      
      await writeChecks(limitedChecks);
      console.log(`Checked ${urls.length} URLs`);
    }
  } catch (error) {
    console.error('Error in automatic health check:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await initializeData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();