#!/bin/bash

echo "🚀 Setting up Cover Letter Generator API..."

# Navigate to API directory
cd api

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit api/.env and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_actual_openai_api_key_here"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit api/.env and add your OpenAI API key"
echo "2. Start the API server: cd api && npm run dev"
echo "3. Build your Chrome extension: npm run build"
echo "4. Load the extension in Chrome and test!"
echo ""
echo "API will run on: http://localhost:3001"
echo "Health check: http://localhost:3001/api/health"
