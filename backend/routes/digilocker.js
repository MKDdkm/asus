const express = require('express');
const router = express.Router();

// DigiLocker API Configuration
// NOTE: In production, store these in environment variables
const DIGILOCKER_CONFIG = {
  clientId: process.env.DIGILOCKER_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3001/api/digilocker/callback',
  authUrl: 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize',
  tokenUrl: 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/token',
  apiUrl: 'https://api.digitallocker.gov.in/public/oauth2/1'
};

/**
 * Step 1: Initiate OAuth flow
 * Redirect user to DigiLocker authorization page
 */
router.get('/authorize', (req, res) => {
  const state = Math.random().toString(36).substring(7); // CSRF protection
  
  const authUrl = `${DIGILOCKER_CONFIG.authUrl}?` +
    `response_type=code&` +
    `client_id=${DIGILOCKER_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(DIGILOCKER_CONFIG.redirectUri)}&` +
    `state=${state}`;
  
  // Store state in session for verification (in production, use secure session storage)
  req.session = req.session || {};
  req.session.digilockerState = state;
  
  res.json({ 
    success: true, 
    authUrl,
    message: 'Redirect user to this URL for DigiLocker authorization'
  });
});

/**
 * Step 2: OAuth callback
 * DigiLocker redirects back with authorization code
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state to prevent CSRF
  if (!req.session || req.session.digilockerState !== state) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid state parameter' 
    });
  }
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      error: 'Authorization code not received' 
    });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(DIGILOCKER_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: DIGILOCKER_CONFIG.clientId,
        client_secret: DIGILOCKER_CONFIG.clientSecret,
        redirect_uri: DIGILOCKER_CONFIG.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Access token not received');
    }
    
    // In production, store token securely (encrypted in database)
    req.session.digilockerToken = tokenData.access_token;
    req.session.digilockerRefreshToken = tokenData.refresh_token;
    
    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/demo?digilocker=connected`);
    
  } catch (error) {
    console.error('DigiLocker OAuth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to exchange authorization code' 
    });
  }
});

/**
 * Step 3: Exchange auth code for token (Alternative API endpoint)
 */
router.post('/token', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      error: 'Authorization code required' 
    });
  }
  
  try {
    const tokenResponse = await fetch(DIGILOCKER_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: DIGILOCKER_CONFIG.clientId,
        client_secret: DIGILOCKER_CONFIG.clientSecret,
        redirect_uri: DIGILOCKER_CONFIG.redirectUri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    res.json({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });
    
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get access token' 
    });
  }
});

/**
 * Step 4: Get list of documents
 */
router.get('/documents', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  try {
    // Call DigiLocker API to get issued documents
    const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/issued`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    // Parse and format documents
    const documents = (data.items || []).map(item => ({
      docType: item.doctype,
      uri: item.uri,
      name: item.name,
      size: item.size,
      issuer: item.issuer,
      description: item.description,
      date: item.date
    }));
    
    res.json({
      success: true,
      documents
    });
    
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch documents' 
    });
  }
});

/**
 * Step 5: Download specific document
 */
router.post('/download', async (req, res) => {
  const { uri } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  if (!uri) {
    return res.status(400).json({ 
      success: false, 
      error: 'Document URI required' 
    });
  }
  
  try {
    // Call DigiLocker API to get document content
    const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uri })
    });
    
    const documentData = await response.json();
    
    res.json({
      success: true,
      document: {
        content: documentData.content, // Base64 encoded PDF
        name: documentData.name,
        type: documentData.mime_type
      }
    });
    
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to download document' 
    });
  }
});

/**
 * Step 6: Get Aadhaar details (eKYC)
 * Special endpoint for Aadhaar verification
 */
router.get('/aadhaar', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  try {
    // Call DigiLocker API for Aadhaar eKYC
    const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/aadhaar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const aadhaarData = await response.json();
    
    res.json({
      success: true,
      aadhaar: {
        name: aadhaarData.name,
        dob: aadhaarData.dob,
        gender: aadhaarData.gender,
        address: aadhaarData.address,
        photo: aadhaarData.photo, // Base64 encoded
        maskedAadhaar: aadhaarData.uid
      }
    });
    
  } catch (error) {
    console.error('Aadhaar fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Aadhaar details' 
    });
  }
});

module.exports = router;
