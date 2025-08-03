#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cover Letter Generator Extension\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'api', '.env');
const envExamplePath = path.join(__dirname, 'api', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from template\n');
  } else {
    console.log('📝 Creating .env file...');
    const envContent = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Server Configuration
PORT=3001
NODE_ENV=development

# Instructions:
# 1. Get your OpenAI API key from: https://platform.openai.com/api-keys
# 2. Replace 'your_openai_api_key_here' with your actual API key
# 3. Available models: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
# 4. Restart the server after making changes`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created\n');
  }
}

console.log('🔧 Setup Instructions:\n');
console.log('1. 📝 Add your OpenAI API key to api/.env file');
console.log('   - Get your key from: https://platform.openai.com/api-keys');
console.log('   - Replace "your_openai_api_key_here" with your actual key\n');

console.log('2. 🚀 Start the API server:');
console.log('   cd api');
console.log('   pnpm run dev\n');

console.log('3. 🔨 Build the extension:');
console.log('   pnpm run build\n');

console.log('4. 📂 Load the extension in Chrome:');
console.log('   - Open Chrome → Extensions → Developer mode → Load unpacked');
console.log('   - Select the "dist" folder\n');

console.log('5. ✨ Test the extension:');
console.log('   - Navigate to any job posting');
console.log('   - Click the extension icon');
console.log('   - Select job description text');
console.log('   - Generate cover letter\n');

console.log('📊 API Endpoints:');
console.log('   - Health check: http://localhost:3001/api/health');
console.log('   - Generate: http://localhost:3001/api/generate-cover-letter\n');

console.log('🐛 Troubleshooting:');
console.log('   - Check browser console for errors');
console.log('   - Verify API server is running on port 3001');
console.log('   - Make sure .env file has valid OpenAI API key');
console.log('   - Refresh the webpage after loading extension\n');

console.log('🎉 Ready to go! Follow the steps above to get started.');
