const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/analyze-food';
// Create a dummy image file if one doesn't exist for testing
const TEST_IMAGE_PATH = 'test_img.jpg';

async function createDummyImage() {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
        console.log('Creating dummy test image...');
        // Create a simple text file but name it .jpg to pass basic mime checks if any
        fs.writeFileSync(TEST_IMAGE_PATH, 'dummy image content');
    }
}

async function testUpload() {
    await createDummyImage();

    try {
        const formData = new FormData();
        // IMPORTANT: The key must be 'image' because server uses upload.single('image')
        formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        console.log(`Sending POST request to ${API_URL}...`);

        const response = await axios.post(API_URL, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Server responded with error:');
            console.error('Status:', error.response.status);
            console.error('Error Message:', error.response.data.error);
            console.error('Details:', error.response.data.details);
        } else {
            console.error('Error sending request:', error.message);
        }
    }
}

testUpload();
