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

## .stories.json Configuration
To define the stories for your Vue.js components, create a .stories.json file in the same directory as your component file and with the same name. This JSON file should contain an array of objects, each representing a story with its own set of properties props, url, window, localStorage, and sessionStorage settings.

Each object in the array can contain the following keys:

- title: The name of the story.
- props: vue props.
- window: An object to set properties on the window global object for the story.
- localStorage and sessionStorage: Objects to set key-value pairs in the web storage for the 
- url: A string to set the front-end route of the current page for the story.

以下是一个.stories.json文件的例子：

``` json
// button.vue
// button.stories.json

[
    {
        "title": "disabled_true",
        "props": {
            "disabled": true
        },
        "window": {
            "_i18n": {"locale": "en-us"}
        },
        "sessionStorage": {
            "key": "abc"
        },
        "localStorage": {
            "key": "abc"
        },
        "url": "/your-path-here"
    },
    {
        "title": "disabled_false",
        "props": {
            "disabled": false
        },
        "window": {
            "_i18n": {"locale": "zh-hk"}
        },
        "sessionStorage": {
            "key": "xyz"
        },
        "localStorage": {
            "key": "xyz"
        },
        "url": "/your-path-here"
    }
]

```