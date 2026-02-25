
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '.env') });

async function verifyCredentials() {
  console.log('\n--- Verifying Google Credentials ---');
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Ensure we replace literal \n if present, though likely not needed with dotenv
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;

  console.log(`Project ID: ${projectId}`);
  console.log(`Client Email: ${clientEmail}`);
  console.log(`Key Length: ${privateKey ? privateKey.length : 'MISSING'}`);

  if (!privateKey) {
    console.error('❌ FATAL: Private Key is missing from .env');
    return;
  }
  
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
        project_id: projectId,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    console.log('1. obtaining client...');
    const client = await auth.getClient();
    console.log('   - Client obtained successfully');

    console.log('2. Requesting Access Token...');
    const accessToken = await client.getAccessToken();
    console.log('   - Access Token received successfully!');
    console.log('   - Credentials syntax is VALID.');

    console.log('3. Checking Project Existence via ResourceManager...');
    // We try to list projects or check specific project details
    // If credentials are valid but project doesn't exist, this might fail or return empty
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`;
    const res = await client.request({ url });
    
    console.log(`   - Project Name: ${res.data.name}`);
    console.log(`   - Project ID: ${res.data.projectId}`);
    console.log(`   - Lifecycle State: ${res.data.lifecycleState}`);
    
    if (res.data.lifecycleState === 'DELETE_REQUESTED' || res.data.lifecycleState === 'DELETE_IN_PROGRESS') {
      console.error('❌ FATAL: Project is being deleted!');
    } else {
      console.log('✅ Project is ACTIVE and accessible.');
    }

  } catch (error) {
    console.error('\n❌ CREDENTIAL VERIFICATION FAILED:');
    console.error(`Message: ${error.message}`);
    if(error.response) {
        console.error('Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyCredentials();
