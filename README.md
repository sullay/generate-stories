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
