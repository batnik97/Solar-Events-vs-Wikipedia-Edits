import typescript from 'rollup-plugin-typescript2'
import includePaths from 'rollup-plugin-includepaths'
import { glob } from 'glob'
import * as path from 'path'
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'

const generationTime = Date.now()

function getScriptFileText(importPath: string) {
  return `
<!-- This file was generated by rollup.config.ts -->
{% load static %}
<script src="{% static '${importPath}' %}"></script>
`
}

// remove old built.js files
const oldBuiltFiles = glob.sync('**/built*.js').concat(glob.sync('**/built*.js.map'))
oldBuiltFiles.forEach((file: string) => {
  unlinkSync(file)
})

// entryPoints is array of [outputFilename, inputFilename]
// we're generating a 'built.js' file for each 'initialize.ts' file
const entryPoints = glob.sync('**/initialize.ts').map((file: string) => { // expected pattern: <app>/static/<app>/<package name>/initialize.ts
  const filePath = file.split(path.sep)
  filePath.pop() // initialize.ts, discard
  const packageName = filePath.pop() // <package name>

  // create built.js file
  const fileName = `built-${generationTime}.js`
  filePath.push(packageName, fileName) // blah/blah/<package name>/built.js
  const newBuildPath = filePath.join(path.sep)

  // create scripts file to import built.js
  const staticIndex = filePath.indexOf('static')
  const importPath = filePath.slice(staticIndex + 1).join(path.sep) // <app>/<package name>/built.js
  const app = filePath[0]
  const scriptDirPathList = [app, 'templates', app, 'built_scripts'] // <app>/templates/<app>/built_scripts
  const scriptFilePathList = [...scriptDirPathList, `${packageName}.html`] // <app>/templates/<app>/built_scripts/<package name>.html
  // create the built scripts directory if it doesn't exist
  const scriptDirPath = scriptDirPathList.join(path.sep)
  if (!existsSync(scriptDirPath)) {
    mkdirSync(scriptDirPath)
  }
  // create the built script file
  const scriptFilePath = scriptFilePathList.join(path.sep)
  writeFileSync(scriptFilePath, getScriptFileText(importPath))

  return [newBuildPath, file]
})

const plugins = [
  typescript(),
  includePaths({ paths: ['./'] }) // allows us to import relative paths in TS
]

const rollupConfig = entryPoints.map(([outputFilename, inputFilename]) => {
  return {
    input: inputFilename,
    output: {
      file: outputFilename,
      format: 'cjs',
      sourcemap: true
    },
    plugins
  }
})

export default rollupConfig
