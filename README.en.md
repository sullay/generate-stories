# generate-stories

## Description
This script automates the process of creating Storybook stories for Vue.js components. It scans a specified directory for .vue files, reads adjacent .stories.json configurations, and generates .stories.js files accordingly.

## Usage
Run the script with Node.js, providing the necessary arguments for your Vue components directory and the output directory for the story files.

``` bash
node generate-stories.js -v path/to/vue/components -o path/to/storybook/stories
```

## Options
- --viewsDir, -v: Specify the directory where Vue files are located.
- --outputDir, -o: Specify the directory where story files will be generated.
- --help, -h: Display the help information.