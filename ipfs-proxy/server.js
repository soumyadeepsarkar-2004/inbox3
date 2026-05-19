const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.send('IPFS Proxy is running'));
app.get('/', (req, res) => res.send('IPFS Proxy is running'));

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

app.post('/api/pin-json', async (req, res) => {
    try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('JSON Pinning failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to pin JSON' });
    }
});

app.post('/api/pin-file', upload.single('file'), async (req, res) => {
    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: req.file.originalname });

        if (req.body.pinataMetadata) {
            formData.append('pinataMetadata', req.body.pinataMetadata);
        }

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                ...formData.getHeaders(),
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('File Pinning failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to pin file' });
    }
});

const PORT = process.env.PROXY_PORT || 3001;
app.listen(PORT, () => {
    console.log(`IPFS Proxy running on port ${PORT}`);
});
