#!/usr/bin/env tsx
/**
 * Episode Validation Script
 * 
 * Validates all episode files to ensure they:
 * 1. Have the auto-generated file header
 * 2. Have complete audio URLs with tracking parameters
 * 3. Have non-empty track listings (warning only)
 * 4. Have proper formatting
 * 
 * Run with: npm run validate-episodes
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  file: string;
  episodeNumber: number;
  errors: string[];
  warnings: string[];
}

// Expected query parameters in audio URLs
const REQUIRED_URL_PARAMS = ['awCollectionId', 'awEpisodeId'];

function getEpisodeFiles(): string[] {
  const pagesDir = path.join(process.cwd(), 'src', 'pages');
  const files = fs.readdirSync(pagesDir);
  return files
    .filter(f => /^Episode\d+\.tsx$/.test(f))
    .map(f => path.join(pagesDir, f));
}

function extractEpisodeNumber(filename: string): number {
  const match = filename.match(/Episode(\d+)\.tsx$/);
  return match ? parseInt(match[1]) : 0;
}

function validateEpisodeFile(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const episodeNumber = extractEpisodeNumber(filename);
  
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for auto-generated header
  if (!content.includes('⚠️ AUTO-GENERATED FILE')) {
    warnings.push('Missing auto-generated file header (may have been manually created)');
  }

  // Extract and validate audio URL
  const audioUrlMatch = content.match(/const audioUrl = ["']([^"']+)["']/);
  if (audioUrlMatch) {
    const audioUrl = audioUrlMatch[1];
    
    // Check for required tracking parameters
    for (const param of REQUIRED_URL_PARAMS) {
      if (!audioUrl.includes(`${param}=`)) {
        errors.push(`Audio URL missing tracking parameter: ${param}`);
      }
    }
    
    // Check URL length
    if (audioUrl.length < 150) {
      warnings.push(`Audio URL seems short (${audioUrl.length} chars) - may be incomplete`);
    }
  } else {
    errors.push('Could not find audioUrl constant in file');
  }

  // Check for empty tracks array
  const tracksMatch = content.match(/const tracks: Track\[\] = \[([\s\S]*?)\];/);
  if (tracksMatch) {
    const tracksContent = tracksMatch[1].trim();
    if (tracksContent === '' || tracksContent === '\n') {
      warnings.push('Track listing is empty - consider adding tracks via CSV importer');
    }
  }

  // Check for proper episode number in file
  const episodeNumMatch = content.match(/const episodeNumber = (\d+)/);
  if (episodeNumMatch) {
    const fileEpisodeNum = parseInt(episodeNumMatch[1]);
    if (fileEpisodeNum !== episodeNumber) {
      errors.push(`Episode number mismatch: filename says ${episodeNumber}, code says ${fileEpisodeNum}`);
    }
  }

  return {
    file: filename,
    episodeNumber,
    errors,
    warnings
  };
}

function main() {
  console.log('🔍 Validating episode files...\n');

  const episodeFiles = getEpisodeFiles();
  
  if (episodeFiles.length === 0) {
    console.log('No episode files found in src/pages/');
    process.exit(0);
  }

  console.log(`Found ${episodeFiles.length} episode files\n`);

  const results: ValidationResult[] = episodeFiles.map(validateEpisodeFile);
  
  let hasErrors = false;
  let hasWarnings = false;

  // Sort by episode number
  results.sort((a, b) => a.episodeNumber - b.episodeNumber);

  for (const result of results) {
    const hasIssues = result.errors.length > 0 || result.warnings.length > 0;
    
    if (hasIssues) {
      console.log(`📄 ${result.file}`);
      
      for (const error of result.errors) {
        console.log(`   ❌ ERROR: ${error}`);
        hasErrors = true;
      }
      
      for (const warning of result.warnings) {
        console.log(`   ⚠️  WARNING: ${warning}`);
        hasWarnings = true;
      }
      
      console.log('');
    }
  }

  // Summary
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const cleanCount = results.filter(r => r.errors.length === 0 && r.warnings.length === 0).length;

  console.log('━'.repeat(50));
  console.log('\n📊 Validation Summary:');
  console.log(`   Total episodes: ${results.length}`);
  console.log(`   ✅ Clean: ${cleanCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);

  if (hasErrors) {
    console.log('\n❌ Validation failed! Please fix the errors above.');
    console.log('   Tip: Regenerate problematic episodes using: npm run generate-episode');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Validation passed with warnings. Review the issues above.');
    process.exit(0);
  } else {
    console.log('\n✅ All episodes validated successfully!');
    process.exit(0);
  }
}

main();
