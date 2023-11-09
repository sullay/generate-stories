#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// 解析命令行参数
const argv = minimist(process.argv.slice(2));
if (!argv.viewsDir || !argv.storiesDir) {
  console.error('Both --viewsDir and --storiesDir need to be specified.');
  process.exit(1);
}
const viewsDir = path.resolve(argv.viewsDir);
const storiesDir = path.resolve(argv.storiesDir);

// 确保提供了必要的参数

// Function to ensure that the directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Ensure the stories directory exists
ensureDirExists(storiesDir);

// Function to recursively find vue files and generate stories
function findVueFiles(dir, relativePath = '') {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // Recursively call findVueFiles with the new relative path
      findVueFiles(filePath, path.join(relativePath, file));
    } else if (file.endsWith('.vue')) {
      const baseName = path.basename(file, '.vue');
      const storyFilePath = path.join(dir, `${baseName}.stories.json`);
      const storyData = fs.existsSync(storyFilePath) ? JSON.parse(fs.readFileSync(storyFilePath, 'utf-8')) : [];
      const fullPath = path.join(relativePath, `${baseName}.stories.js`);
      const storyContent = generateStoryContent(baseName, storyData, filePath, fullPath);

      // Ensure the directory structure is replicated in storiesDir
      const storyDir = path.dirname(path.join(storiesDir, fullPath));
      ensureDirExists(storyDir);

      const storyPath = path.join(storyDir, `${baseName}.stories.js`);
      fs.writeFileSync(storyPath, storyContent);
      console.log(`Story generated for ${fullPath}`);
    }
  });
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

  return `
import ${componentName} from '${importPath}';
import { useRouter } from 'vue-router';
import { reactive, watch } from 'vue';

function extractAfterPropsPrefix(inputString) {
  const prefix = 'props.';
  if (inputString.startsWith(prefix)) {
    return inputString.substring(prefix.length);
  }
  return '';
}

function buildProps(args) {
    const props = {}
    Object.keys(args).forEach((key) => {
        let prop = extractAfterPropsPrefix(key);
        if (prop) props[prop] = args[key];
    });
    return props;
}

export default {
  title: '${titlePath}',
  component: ${componentName},
  decorators: [() => ({ template: '<div><story /></div>' })],
  ${controlsParameters}
};

class Template {
    render(args) {
        const props = reactive({});
        return {
            components: { ${componentName} },
            setup() {
                const router = useRouter();
                watch(args, newArgs => {
                    if (newArgs.url) {
                        router.replace(newArgs.url);
                    }
                    Object.assign(props, buildProps(newArgs));
                }, { immediate: true });
                return { props };
            },
            template: '<${componentName} v-bind="props" />',
        }
    }
}

${defaultExport}
`;
}

// Function to generate additional exports based on story data
function generateExport(story) {
  const { title, props = {}, url } = story;
  return `
export const ${title} = new Template();
${title}.args = ${JSON.stringify({ ...Object.keys(props).reduce((acc, key) => ({ ...acc, [`props.${key}`]: props[key] }), {}), url }, null, 2)};
`;
}

function extractControlsKeys(storyData) {
  const keysSet = new Set();
  
  storyData.forEach(item => {
    if (item.props) {
      Object.keys(item.props).forEach(prop => {
        keysSet.add(`props.${prop}`);
      });
    }
    if (item.url) {
      keysSet.add('url');
    }
  });

  return Array.from(keysSet); // 转换回数组
}

// Start the recursive file search from the views directory
findVueFiles(viewsDir);

console.log('Finished generating stories.');
