#!/usr/bin/env pwsh

Write-Host "🚀 Starting Cover Letter Generator API Server..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📍 Health check: http://localhost:3001/api/health" -ForegroundColor Cyan  
Write-Host ""
Write-Host "🔄 Starting in development mode with auto-reload..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "$PSScriptRoot\api"
pnpm run dev
