const fs = require('fs');
const path = require('path');

// Helper to log with prefix
function log(msg) {
  console.log(`[postbuild] ${msg}`);
}

try {
  log('Starting post-build script...');

  // 1. Determine build output path
  let outputPath = 'dist/mode-list'; // Default fallback
  const angularJsonPath = path.resolve(__dirname, 'angular.json');

  if (fs.existsSync(angularJsonPath)) {
    try {
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
      // Find the first project build outputPath
      const projects = angularJson.projects;
      const firstProjectName = Object.keys(projects)[0];
      if (firstProjectName && projects[firstProjectName].architect?.build?.options?.outputPath) {
        outputPath = projects[firstProjectName].architect.build.options.outputPath;
        log(`Found output path in angular.json: "${outputPath}"`);
      }
    } catch (err) {
      log(`Warning: Failed to parse angular.json, using default "${outputPath}". Error: ${err.message}`);
    }
  } else {
    log(`Warning: angular.json not found, using default "${outputPath}"`);
  }

  // Define target directories
  const targetDirs = [
    path.resolve(__dirname, outputPath), // Build output directory (e.g., dist/mode-list)
    path.resolve(__dirname, 'dist')       // Literal dist directory just in case
  ];

  // Source files
  const policySrc = path.resolve(__dirname, 'policy.html');
  const termsSrc = path.resolve(__dirname, 'terms.html');

  if (!fs.existsSync(policySrc)) {
    throw new Error(`Source file not found: ${policySrc}`);
  }
  if (!fs.existsSync(termsSrc)) {
    throw new Error(`Source file not found: ${termsSrc}`);
  }

  // Execute copying for both target directories (if they exist/are valid)
  targetDirs.forEach((baseDir) => {
    // If the base output directory doesn't exist, skip it (unless it's the literal 'dist' folder)
    if (!fs.existsSync(baseDir)) {
      if (baseDir.endsWith('dist')) {
        log(`Creating literal dist folder...`);
        fs.mkdirSync(baseDir, { recursive: true });
      } else {
        log(`Skipping output directory "${baseDir}" because it does not exist (did ng build run successfully?).`);
        return;
      }
    }

    const babyzmanDir = path.join(baseDir, 'babyzman');
    const policyDestDir = path.join(babyzmanDir, 'policy');
    const termsDestDir = path.join(babyzmanDir, 'terms');

    // Create directories
    log(`Creating directory: ${policyDestDir}`);
    fs.mkdirSync(policyDestDir, { recursive: true });

    log(`Creating directory: ${termsDestDir}`);
    fs.mkdirSync(termsDestDir, { recursive: true });

    // Copy policy.html -> policy/index.html
    const policyDestFile = path.join(policyDestDir, 'index.html');
    fs.copyFileSync(policySrc, policyDestFile);
    log(`Copied & renamed: ${policySrc} -> ${policyDestFile}`);

    // Copy terms.html -> terms/index.html
    const termsDestFile = path.join(termsDestDir, 'index.html');
    fs.copyFileSync(termsSrc, termsDestFile);
    log(`Copied & renamed: ${termsSrc} -> ${termsDestFile}`);
  });

  log('Post-build script completed successfully!');
} catch (error) {
  console.error('[postbuild] Error occurred:', error);
  process.exit(1);
}
