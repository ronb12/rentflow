#!/bin/bash
# Create placeholder icons for PWA
cd public

# Simple SVG icon with building icon representation
cat > icon-192.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect fill="#3b82f6" width="192" height="192" rx="42"/>
  <rect fill="#ffffff" x="40" y="60" width="112" height="72" rx="4"/>
  <rect fill="#ffffff" x="64" y="88" width="64" height="44"/>
  <rect fill="#ffffff" x="64" y="136" width="64" height="16" rx="2"/>
  <text x="96" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">RentFlow</text>
</svg>
EOF

cat > icon-512.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect fill="#3b82f6" width="512" height="512" rx="112"/>
  <rect fill="#ffffff" x="120" y="160" width="272" height="192" rx="12"/>
  <rect fill="#ffffff" x="176" y="224" width="160" height="120"/>
  <rect fill="#ffffff" x="176" y="360" width="160" height="32" rx="4"/>
  <text x="256" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="60" font-weight="bold">RentFlow</text>
</svg>
EOF

echo "Icons created as SVG files. Convert to PNG manually or use online converter."

