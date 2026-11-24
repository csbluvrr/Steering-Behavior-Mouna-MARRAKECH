/**
 * scripts/update-readme.js
 * 
 * Script autonome de mise à jour automatique du README.md.
 * Scanne l'ensemble des dossiers du projet contenant un sketch p5.js,
 * extrait les métadonnées (classes, comportements Reynolds implémentés),
 * et regénère la table synoptique dans README.md sans écraser le reste du fichier.
 * 
 * Utilisation : node scripts/update-readme.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const README_PATH = path.join(ROOT_DIR, 'README.md');

const REYNOLDS_BEHAVIORS = [
  'seek',
  'flee',
  'pursue',
  'evade',
  'arrive',
  'wander',
  'avoidObstacle',
  'avoidObstacles',
  'followPath',
  'follow',
  'flow',
  'separate',
  'align',
  'cohere',
  'flock'
];

function scanProjectDirs() {
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || ['node_modules', 'scripts', 'docs', 'article craig reynolds', 'cours'].includes(entry.name)) {
      continue;
    }

    const dirPath = path.join(ROOT_DIR, entry.name);
    const files = fs.readdirSync(dirPath);
    const hasIndex = files.includes('index.html');
    const hasSketch = files.includes('sketch.js');

    if (!hasIndex && !hasSketch) continue;

    const jsFiles = files.filter(f => f.endsWith('.js') && f !== 'p5.min.js' && f !== 'p5.sound.min.js');
    const classesFound = new Set();
    const behaviorsFound = new Set();

    for (const jsFile of jsFiles) {
      const content = fs.readFileSync(path.join(dirPath, jsFile), 'utf-8');
      
      // Détection des classes (ex: class Vehicle, class Target extends Vehicle)
      const classMatches = content.matchAll(/class\s+([A-Za-z0-9_]+)/g);
      for (const match of classMatches) {
        classesFound.add(match[1]);
      }

      // Détection des méthodes de comportements
      for (const b of REYNOLDS_BEHAVIORS) {
        const regex = new RegExp(`\\b${b}\\s*\\(`, 'i');
        if (regex.test(content)) {
          behaviorsFound.add(b.toLowerCase());
        }
      }
    }

    const isCorrection = entry.name.toLowerCase().includes('correction');
    const classesList = Array.from(classesFound).join(', ') || 'Vehicle';
    const behaviorsList = Array.from(behaviorsFound).join(', ') || '-';

    projects.push({
      folder: entry.name,
      isCorrection,
      classes: classesList,
      behaviors: behaviorsList,
      filesCount: files.length,
      path: `[${entry.name}](./${entry.name}/index.html)`
    });
  }

  // Tri naturel (1-Seek, 2-PursueEvade, ...)
  projects.sort((a, b) => a.folder.localeCompare(b.folder, undefined, { numeric: true, sensitivity: 'base' }));
  return projects;
}

function generateMarkdownTable(projects) {
  let md = '| Module / Application | Type | Classes Détectées | Comportements Détectés | Lien Direct |\n';
  md += '|---|---|---|---|---|\n';

  for (const p of projects) {
    const type = p.isCorrection ? 'Correction / Avancé' : 'Exercice / Démo';
    md += `| **${p.folder}** | ${type} | \`${p.classes}\` | \`${p.behaviors}\` | ${p.path} |\n`;
  }

  return md;
}

function updateReadme() {
  if (!fs.existsSync(README_PATH)) {
    console.error(`Fichier README.md introuvable : ${README_PATH}`);
    process.exit(1);
  }

  const projects = scanProjectDirs();
  const tableMd = generateMarkdownTable(projects);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  let content = fs.readFileSync(README_PATH, 'utf-8');

  // Remplacement de la table
  const tableStart = '<!-- START:PROJECTS_TABLE -->';
  const tableEnd = '<!-- END:PROJECTS_TABLE -->';

  if (content.includes(tableStart) && content.includes(tableEnd)) {
    const before = content.substring(0, content.indexOf(tableStart) + tableStart.length);
    const after = content.substring(content.indexOf(tableEnd));
    content = `${before}\n\n${tableMd}\n${after}`;
  } else {
    // Si les balises n'existent pas encore, on ajoute la section
    content += `\n\n## État des Modules & Applications\n\n${tableStart}\n\n${tableMd}\n${tableEnd}\n`;
  }

  // Remplacement de la date
  const dateStart = '<!-- START:LAST_UPDATED -->';
  const dateEnd = '<!-- END:LAST_UPDATED -->';

  if (content.includes(dateStart) && content.includes(dateEnd)) {
    const before = content.substring(0, content.indexOf(dateStart) + dateStart.length);
    const after = content.substring(content.indexOf(dateEnd));
    content = `${before} *Dernière actualisation automatique : ${now}* ${after}`;
  }

  fs.writeFileSync(README_PATH, content, 'utf-8');
  console.log(`✅ README.md mis à jour avec succès (${projects.length} modules référencés).`);
}

updateReadme();
