# AbsenYuk Demo — Production Mode
# Serves frontend + API on a single port via Express
# Forward this port in VS Code and set visibility to Public

$env:NODE_ENV = 'production'
Set-Location -LiteralPath "$PSScriptRoot\backend"
npm start
