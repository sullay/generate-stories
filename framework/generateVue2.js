// Function to generate the story content
module.exports = function generateVue2(componentName, importPath, titlePath, controlsParameters, defaultExport) {
  return `
/* eslint-disable*/
import ${componentName} from '${importPath}';

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
    const data = () => ({
      props: buildData(args, 'props'),
    });

    Object.assign(window, buildData(args, 'window'));
    Object.entries(buildData(args, 'localStorage')).forEach(([key, val]) => localStorage.setItem(key, val));
    Object.entries(buildData(args, 'sessionStorage')).forEach(([key, val]) => sessionStorage.setItem(key, val));

    return {
      components: { ${componentName} },
      data,
      watch: {
        args: {
          immediate: true,
          handler(newArgs = {}) {
            if (newArgs.url) {
              this.$router.replace(newArgs.url);
            }
            Object.assign(this.props, buildData(newArgs, 'props'));
          }
        }
      },
      template: '<${componentName} v-bind="props" />',
    };
  }
}

${defaultExport}
`;
}