#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const minimist = require('minimist');
const generateVue2 = require('./framework/generateVue2')
const generateVue3 = require('./framework/generateVue3')

// 解析命令行参数
const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'viewsDir',
    o: 'outputDir',
    f: 'framework'
  },
  string: ['viewsDir', 'outputDir', 'framework'],
  boolean: ['help'],
  default: {
    outputDir: './stories',
    framework: 'vue3'
  }
});

if (argv.help) {
  console.log(`
Usage: generate-stories [options]

Options:
  --viewsDir, -v   Specify the directory where Vue files are located
  --outputDir, -o  Specify the directory where story files will be generated (default: "./stories")
  --help, -h       Show help
  --framework, -f  vue3(default)、vue2
`);
  process.exit(0);
}

if (!argv.viewsDir || !argv.outputDir) {
  console.error('Both --viewsDir and --outputDir need to be specified.');
  process.exit(1);
}
const viewsDir = path.resolve(argv.viewsDir);
const storiesDir = path.resolve(argv.outputDir);

// Ensure that the directories exist or exit
async function ensureDirExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Function to recursively find vue files and generate stories
async function findVueFiles(dir, relativePath = '') {
  let files;
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error}`);
    return;
  }

  for (let file of files) {
    const filePath = path.join(dir, file);
    let fileStat;
    try {
      fileStat = await fs.stat(filePath);
    } catch (error) {
      console.error(`Error reading file stats ${filePath}: ${error}`);
      continue;
    }

    if (fileStat.isDirectory()) {
      await findVueFiles(filePath, path.join(relativePath, file));
    } else if (file.endsWith('.vue')) {
      const baseName = path.basename(file, '.vue');
      const storyFilePath = path.join(dir, `${baseName}.stories.json`);
      let storyData = [];
      try {
        storyData = await fs.readFile(storyFilePath, 'utf-8');
        storyData = JSON.parse(storyData);
      } catch (error) {
        // Assuming error is due to file not existing, which is fine
      }
      const fullPath = path.join(relativePath, `${baseName}.stories.js`);
      const storyContent = generateStoryContent(baseName + "Component", storyData, filePath, fullPath);

      // Ensure the directory structure is replicated in storiesDir
      const storyDir = path.dirname(path.join(storiesDir, fullPath));
      await ensureDirExists(storyDir);

      const storyPath = path.join(storyDir, `${baseName}.stories.js`);
      try {
        await fs.writeFile(storyPath, storyContent);
        console.log(`Story generated for ${fullPath}`);
      } catch (error) {
        console.error(`Error writing story file ${storyPath}: ${error}`);
      }
    }
  }
}

// Function to generate the story content
function generateStoryContent(componentName, storyData, vueFilePath, fullPath) {
  // Get the directory of the story file
  const storyDir = path.dirname(path.resolve(storiesDir, fullPath));
  // Correctly calculate the import path from the story's location to the Vue file
  const importPath = `${path.relative(storyDir, vueFilePath).replace(/\\/g, '/')}`;
  const titlePath = path.relative(viewsDir, vueFilePath).replace(/\\/g, '/').replace(/\.vue$/, '');
  const controlsKeys = extractControlsKeys(storyData); // 提取控件键
  // Use the full relative path for the title
  const defaultExport = storyData.length
    ? storyData.map(data => generateExport(data)).join('\n\n')
    : `export const Default = new Template();
Default.args = {};`;

  // 使用提取的键生成参数对象
  const controlsParameters =
    `parameters: {
    controls: { include: ${JSON.stringify(controlsKeys)} }
  },`

  if (argv.framework === 'vue2') {
    return generateVue2(componentName, importPath, titlePath, controlsParameters, defaultExport);
  } else if (argv.framework === 'vue3') {
    return generateVue3(componentName, importPath, titlePath, controlsParameters, defaultExport);
  }
}

// Function to generate additional exports based on story data
function generateExport(story) {
  const {
    title, props = {}, url,
    window: windowOverrides = {},
    localStorage: localStorageOverrides = {},
    sessionStorage: sessionStorageOverrides = {}
  } = story;

  // 创建故事特定的参数对象
  const storyArgs = {
    ...buildPropArgs(windowOverrides, 'window'),
    ...buildPropArgs(localStorageOverrides, 'localStorage'),
    ...buildPropArgs(sessionStorageOverrides, 'sessionStorage'),
    ...buildPropArgs(props, 'props'),
    url
  };

  return `
export const ${title} = new Template();
${title}.args = ${JSON.stringify(storyArgs, null, 2)};
`;
}

function buildPropArgs(obj, prefix) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[`${prefix}.${key}`] = value;
    return acc;
  }, {});
}

function extractControlsKeys(storyData) {
  const nonKeysSet = new Set(['title'])
  const keysSet = new Set();

  for (const data of storyData) {
    Object.keys(data).forEach(key => {
      if (nonKeysSet.has(key)) return;
      if (data[key] instanceof Object) {
        Object.keys(data[key]).forEach(itemKey => {
          keysSet.add(`${key}.${itemKey}`);
        })
      } else {
        keysSet.add(key)
      }
    });
  }
  return Array.from(keysSet); // 转换回数组
}

// Start the recursive file search from the views directory
(async () => {
  await ensureDirExists(viewsDir);
  await ensureDirExists(storiesDir);
  await findVueFiles(viewsDir);
  console.log('Finished generating stories.');
})();