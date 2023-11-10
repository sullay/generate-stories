# generate-stories
[English Version](./README.en.md)

## 描述
此脚本自动化为Vue.js组件创建Storybook故事的过程。它扫描指定目录中的.vue文件，读取相邻的.stories.json配置，并相应地生成.stories.js文件。

## 使用方法
使用Node.js运行脚本，并为您的Vue组件目录和故事文件的输出目录提供必要的参数。

``` bash
node generate-stories.js -v path/to/vue/components -o path/to/storybook/stories
```

## 选项

- --viewsDir, -v：指定Vue文件所在的目录。
- --outputDir, -o：指定故事文件将被生成的目录。
- --help, -h：显示帮助信息。

## .stories.json 配置说明
要为您的Vue.js组件定义故事，请在组件文件所在的同一目录下创建一个与组件同名的.stories.json文件。该JSON文件应包含一个对象数组，每个对象代表一个故事及其自己的属性集（props）、window、localStorage 和 sessionStorage 设置。

数组中的每个对象可以包含以下键：

- title：故事的名称。
- props：一个包含组件期望的响应式属性的对象。
- window：一个对象，用于为故事设置window全局对象的属性。
- localStorage 和 sessionStorage：对象，用于为故事在Web存储中设置键值对。

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
        }
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
        }
    }
]

```