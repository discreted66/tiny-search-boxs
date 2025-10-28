import path from 'node:path'
import scriptSetupPlugin from 'unplugin-vue2-script-setup/vite'
import { defineConfig, loadEnv } from 'vite'
import dynamicImportPlugin from 'vite-plugin-dynamic-import'
import importPlugin from '@opentiny/vue-vite-import'
import inspectPlugin from 'vite-plugin-inspect'
import { createVuePlugin as vue2Plugin } from 'vite-plugin-vue2'
import { createSvgPlugin as vue2SvgPlugin } from 'vite-plugin-vue2-svg'


export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), '')

  return {
    server: {
      host: 'localhost',
      open: true
    },
    define: {
      'process.env': {
        TINY_MODE: 'pc'
      }
    },
    plugins: [
      vue2Plugin({
        jsx: true,
        include: [/\.vue$/, /\.md$/]
      }),
     
      scriptSetupPlugin(),
      vue2SvgPlugin({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            },
            'prefixIds'
          ]
        }
      }),
      // importPlugin({
      //   options: [
      //     {
      //       libraryName: '@opentiny/vue'
      //     },
      //     ...['icon', 'icon-saas'].map((lib) => ({
      //       libraryName: `@opentiny/vue-${lib}`,
      //       customName: (name) => {
      //         return name === 'default'
      //           ? `@opentiny/vue-${lib}$`
      //           : `@opentiny/vue-${lib}/${name.replace(/^icon-/, '')}/index.ts`
      //       }
      //     }))
      //   ],
      //   exclude: [/\.md\?.+\.js/]
      // }),
      dynamicImportPlugin()
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.vue'],
      alias: {
        'vue': path.resolve('node_modules/vue/dist/vue.esm.js'),
        "@opentiny/vue-button": path.resolve('../search-box/node_modules/@opentiny/vue-button'),
        "@opentiny/vue-button-group": path.resolve('../search-box/node_modules/@opentiny/vue-button-group'),
        "@opentiny/vue-checkbox": path.resolve('../search-box/node_modules/@opentiny/vue-checkbox'),
        "@opentiny/vue-checkbox-group": path.resolve('../search-box/node_modules/@opentiny/vue-checkbox-group'),
        "@opentiny/vue-date-picker": path.resolve('../search-box/node_modules/@opentiny/vue-date-picker'),
        "@opentiny/vue-dropdown": path.resolve('../search-box/node_modules/@opentiny/vue-dropdown'),
        "@opentiny/vue-dropdown-item": path.resolve('../search-box/node_modules/@opentiny/vue-dropdown-item'),
        "@opentiny/vue-dropdown-menu": path.resolve('../search-box/node_modules/@opentiny/vue-dropdown-menu'),
        "@opentiny/vue-form": path.resolve('../search-box/node_modules/@opentiny/vue-form'),
        "@opentiny/vue-form-item": path.resolve('../search-box/node_modules/@opentiny/vue-form-item'),
        "@opentiny/vue-icon": path.resolve('../search-box/node_modules/@opentiny/vue-icon'),
        "@opentiny/vue-input": path.resolve('../search-box/node_modules/@opentiny/vue-input'),
        "@opentiny/vue-loading": path.resolve('../search-box/node_modules/@opentiny/vue-loading'),
        "@opentiny/vue-option": path.resolve('../search-box/node_modules/@opentiny/vue-option'),
        "@opentiny/vue-popover": path.resolve('../search-box/node_modules/@opentiny/vue-popover'),
        "@opentiny/vue-select": path.resolve('../search-box/node_modules/@opentiny/vue-select'),
        "@opentiny/vue-tag": path.resolve('../search-box/node_modules/@opentiny/vue-tag'),
        "@opentiny/vue-tooltip": path.resolve('../search-box/node_modules/@opentiny/vue-tooltip'),
        "@opentiny/vue-common": path.resolve('../search-box/node_modules/@opentiny/vue-common'),
      }
    },
    // define: {
    //   'process.env': env
    // },
  }
})
