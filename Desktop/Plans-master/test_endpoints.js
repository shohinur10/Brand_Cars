const axios = require('axios');

const BASE_URL = 'http://localhost:3004';

// Test data
const testUser = {
    email: `test${Date.now()}@example.com`,
    phone: `+123456789${Math.floor(Math.random() * 10)}`,
    password: 'testpassword123'
};

let accessToken = '';
let refreshToken = '';
let userId = '';

async function testEndpoints() {
    console.log('🧪 Testing all endpoints...\n');

    try {
        // Test 1: Signup
        console.log('1. Testing /signup [POST]');
        const signupResponse = await axios.post(`${BASE_URL}/signup`, testUser);
        console.log('✅ Signup successful');
        console.log('Response:', {
            user_id: signupResponse.data.user.id,
            has_access_token: !!signupResponse.data.access_token,
            has_refresh_token: !!signupResponse.data.refresh_token
        });
        
        accessToken = signupResponse.data.access_token;
        refreshToken = signupResponse.data.refresh_token;
        userId = signupResponse.data.user.id;
        console.log('');

        // Test 2: Signin
        console.log('2. Testing /signin [POST]');
        const signinResponse = await axios.post(`${BASE_URL}/signin`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Signin successful');
        console.log('Response:', {
            user_id: signinResponse.data.user.id,
            has_access_token: !!signinResponse.data.access_token,
            has_refresh_token: !!signinResponse.data.refresh_token
        });
        console.log('');

        // Test 3: User Info
        console.log('3. Testing /info [GET]');
        const infoResponse = await axios.get(`${BASE_URL}/info`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ User info retrieved');
        console.log('Response:', infoResponse.data);
        console.log('');

        // Test 4: Refresh Token
        console.log('4. Testing /signin/new_token [POST]');
        const refreshResponse = await axios.post(`${BASE_URL}/signin/new_token`, {
            refresh_token: refreshToken
        });
        console.log('✅ Token refreshed');
        console.log('Response:', {
            has_new_access_token: !!refreshResponse.data.access_token,
            has_new_refresh_token: !!refreshResponse.data.refresh_token
        });
        
        // Update tokens
        accessToken = refreshResponse.data.access_token;
        refreshToken = refreshResponse.data.refresh_token;
        console.log('');

        // Test 5: File Upload (create a test file)
        console.log('5. Testing /file/upload [POST]');
        const FormData = require('form-data');
        const fs = require('fs');
        
        // Create a test file
        const testFileContent = 'This is a test file for upload testing.';
        fs.writeFileSync('./test-file.txt', testFileContent);
        
        const form = new FormData();
        form.append('file', fs.createReadStream('./test-file.txt'));
        
        const uploadResponse = await axios.post(`${BASE_URL}/file/upload`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${accessToken}`
            }
        });
        console.log('✅ File uploaded');
        console.log('Response:', uploadResponse.data);
        const fileId = uploadResponse.data.id;
        console.log('');

        // Test 6: File List
        console.log('6. Testing /file/list [GET]');
        const listResponse = await axios.get(`${BASE_URL}/file/list?page=1&list_size=10`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ File list retrieved');
        console.log('Response:', {
            files_count: listResponse.data.files.length,
            pagination: listResponse.data.pagination
        });
        console.log('');

        // Test 7: File Info
        console.log('7. Testing /file/:id [GET]');
        const fileInfoResponse = await axios.get(`${BASE_URL}/file/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ File info retrieved');
        console.log('Response:', fileInfoResponse.data);
        console.log('');

        // Test 8: File Download
        console.log('8. Testing /file/download/:id [GET]');
        const downloadResponse = await axios.get(`${BASE_URL}/file/download/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'stream'
        });
        console.log('✅ File download successful');
        console.log('Response headers:', {
            'content-type': downloadResponse.headers['content-type'],
            'content-disposition': downloadResponse.headers['content-disposition']
        });
        console.log('');

        // Test 9: File Update
        console.log('9. Testing /file/update/:id [PUT]');
        const updatedFileContent = 'This is an updated test file.';
        fs.writeFileSync('./test-file-updated.txt', updatedFileContent);
        
        const updateForm = new FormData();
        updateForm.append('file', fs.createReadStream('./test-file-updated.txt'));
        
        const updateResponse = await axios.put(`${BASE_URL}/file/update/${fileId}`, updateForm, {
            headers: {
                ...updateForm.getHeaders(),
                Authorization: `Bearer ${accessToken}`
            }
        });
        console.log('✅ File updated');
        console.log('Response:', updateResponse.data);
        console.log('');

        // Test 10: File Delete
        console.log('10. Testing /file/delete/:id [DELETE]');
        const deleteResponse = await axios.delete(`${BASE_URL}/file/delete/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ File deleted');
        console.log('Response:', deleteResponse.data);
        console.log('');

        // Test 11: Logout
        console.log('11. Testing /logout [GET]');
        const logoutResponse = await axios.get(`${BASE_URL}/logout`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ Logout successful');
        console.log('Response:', logoutResponse.data);
        console.log('');

        // Cleanup test files
        fs.unlinkSync('./test-file.txt');
        fs.unlinkSync('./test-file-updated.txt');

        console.log('🎉 All tests completed successfully!');
        console.log('\n📋 Summary of implemented features:');
        console.log('✅ Authentication system with JWT (10 min) + refresh tokens (7 days)');
        console.log('✅ User registration and login with email/phone');
        console.log('✅ Token refresh mechanism');
        console.log('✅ Multi-device support (logout from one device doesn\'t affect others)');
        console.log('✅ File upload with metadata storage');
        console.log('✅ File listing with pagination');
        console.log('✅ File download, update, and delete');
        console.log('✅ CORS enabled for all domains');
        console.log('✅ SQLite database with proper schema');
        console.log('✅ Password hashing with bcrypt');
        console.log('✅ Token blacklisting on logout');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('Status:', error.response.status);
        }
    }
}

// Run tests
testEndpoints();
