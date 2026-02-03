#!/bin/bash
# Post-build script to generate pre-rendered HTML files for SEO and social sharing

echo "Running post-build script..."
echo "Generating pre-rendered HTML files for SEO..."

# Run the TypeScript prerender script using tsx (TypeScript executor)
npx tsx scripts/generate-prerender.ts

echo "Post-build complete!"
