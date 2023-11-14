// Function to generate the story content
module.exports = function generateVue3(componentName, importPath, titlePath, controlsParameters, defaultExport) {
  return `
/* eslint-disable*/
import ${componentName} from '${importPath}';
import { useRouter } from 'vue-router';
import { reactive, watch } from 'vue';

function extractAfterPrefix(prefix, inputString) {
  if (inputString.startsWith(prefix)) {
      return inputString.substring(prefix.length);
  }
  return '';
}

function buildData(args, prefix) {
  const data = {};
  Object.keys(args).forEach((argsKey) => {
      const key = extractAfterPrefix(prefix + '.', argsKey);
      if (key) data[key] = args[argsKey];
  });
  return data;
}

export default {
  title: 'Auto Generate Stories/${titlePath}',
  component: ${componentName},
  decorators: [() => ({ template: '<div><story /></div>' })],
  ${controlsParameters}
};

class Template {
    render(args) {
        const props = reactive({});
        Object.assign(window, buildData(args, 'window'));
        Object.entries(buildData(args, 'localStorage')).forEach(([key, val]) => localStorage.setItem(key, val));
        Object.entries(buildData(args, 'sessionStorage')).forEach(([key, val]) => sessionStorage.setItem(key, val));
        return {
            components: { ${componentName} },
            setup() {
                const router = useRouter();
                watch(args, newArgs => {
                    if (newArgs.url) {
                        router.replace(newArgs.url);
                    }
                    Object.assign(props, buildData(newArgs, 'props'));
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