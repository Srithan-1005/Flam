import 'dotenv/config';
import { generateStudySet } from './ai.js';

async function test() {
  try {
    console.log('Testing with API KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    console.log('API KEY prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'none');
    
    console.log('\nSending test prompt...');
    const result = await generateStudySet('Binary Search');
    console.log('Success! Result topic:', result.topic);
  } catch (err) {
    console.error('Error occurred:');
    console.error(err.message);
  }
}

test();
