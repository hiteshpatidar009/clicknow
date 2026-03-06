import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = process.env.SENDGRID_API_URL || 'https://api.sendgrid.com/v3/mail/send';

async function testSendGrid() {
  console.log('\n🧪 Testing SendGrid Configuration...\n');
  console.log('API Key:', SENDGRID_API_KEY ? `${SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('API URL:', SENDGRID_API_URL);
  console.log('From:', process.env.SMTP_FROM);
  console.log('\n📧 Sending test email...\n');

  try {
    const response = await axios.post(
      SENDGRID_API_URL,
      {
        personalizations: [
          {
            to: [{ email: 'hiteshpatidar009@gmail.com' }]
          }
        ],
        from: {
          email: 'royalit.demo@gmail.com',
          name: 'royalit'
        },
        subject: 'Test OTP from ClickNow',
        content: [
          {
            type: 'text/plain',
            value: 'Your OTP is 123456'
          },
          {
            type: 'text/html',
            value: '<p>Your OTP is <b>123456</b></p>'
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Email sent via SendGrid');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ FAILED! SendGrid error:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.errors) {
      console.log('\n🔍 Error Details:');
      error.response.data.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.message}`);
        if (err.field) console.log(`   Field: ${err.field}`);
        if (err.help) console.log(`   Help: ${err.help}`);
      });
    }
  }
}

testSendGrid();
