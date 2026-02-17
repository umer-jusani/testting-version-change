// vite.config.js
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildVersion = '5'
const versionStateFile = '.vite-file-versions.json'

const normalizePath = (value) => value.replaceAll('\\', '/')

const stripVersionTag = (fileName) => fileName.replace(/\.v\d+(?=\.[^./]+$)/, '');

const addVersionTag = (fileName, version) => {
  const withoutVersion = stripVersionTag(fileName)
  return withoutVersion.replace(/(\.[^./]+)$/, `.v${version}$1`)
}

const sha1 = (value) => createHash('sha1').update(value).digest('hex')

const asBuffer = (source) => {
  if (typeof source === 'string') return Buffer.from(source)
  if (source instanceof Uint8Array) return Buffer.from(source)
  return Buffer.alloc(0)
}

const isTextAsset = (fileName) => /\.(css|js|html|json|map|svg|txt)$/i.test(fileName)
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const stripAssetsPrefix = (value) => value.replace(/^assets\//, '')
const isJavaScriptFile = (fileName) => /\.js$/i.test(fileName)
const toRelativeKeyPath = (absoluteOrRelativePath, rootDir) => {
  if (!absoluteOrRelativePath) return ''
  const relative = path.isAbsolute(absoluteOrRelativePath)
    ? path.relative(rootDir, absoluteOrRelativePath)
    : absoluteOrRelativePath
  return normalizePath(relative)
}
const findPreviousStateEntry = (state, key) => {
  if (state[key]) return state[key]

  const separatorIndex = key.indexOf(':')
  if (separatorIndex === -1) return undefined

  const kind = key.slice(0, separatorIndex + 1)
  const target = key.slice(separatorIndex + 1).toLowerCase()
  for (const [existingKey, value] of Object.entries(state)) {
    if (!existingKey.startsWith(kind)) continue
    const existingPath = existingKey.slice(separatorIndex + 1).toLowerCase()
    if (existingPath === target || existingPath.endsWith(`/${target}`)) {
      return value
    }
  }
  return undefined
}

const selectiveVersionPlugin = (selectedVersion) => {
  let rootDir = process.cwd()
  let previousState = {}
  let nextState = {}

  return {
    name: 'selective-version-plugin',
    apply: 'build',
    configResolved(config) {
      rootDir = config.root
    },
    buildStart() {
      const statePath = path.join(rootDir, versionStateFile)
      if (fs.existsSync(statePath)) {
        try {
          previousState = JSON.parse(fs.readFileSync(statePath, 'utf8'))
        } catch {
          previousState = {}
        }
      } else {
        previousState = {}
      }
      nextState = {}
    },
    generateBundle(_outputOptions, bundle) {
      const renameMap = new Map()

      for (const [oldFileName, item] of Object.entries(bundle)) {
        if (!oldFileName.startsWith('assets/')) continue
        if (oldFileName.endsWith('.map')) continue

        const normalizedOld = normalizePath(oldFileName)
        const fileNameWithoutVersion = stripVersionTag(normalizedOld)
        const key = item.type === 'chunk'
          ? `chunk:${toRelativeKeyPath(item.facadeModuleId || item.name || fileNameWithoutVersion, rootDir)}`
          : `asset:${toRelativeKeyPath(item.name || fileNameWithoutVersion, rootDir)}`

        if (fileNameWithoutVersion.endsWith('.gif')) {
          const hash = sha1(asBuffer(item.type === 'chunk' ? item.code : item.source))
          const existing = previousState[key] || {}
          nextState[key] = {
            hash,
            version: existing.version || selectedVersion,
            fileName: fileNameWithoutVersion
          }
          continue
        }

        const contentHash = sha1(asBuffer(item.type === 'chunk' ? item.code : item.source))
        const prev = findPreviousStateEntry(previousState, key)
        const versionToUse = prev && prev.hash === contentHash ? prev.version : selectedVersion

        // Keep non-JS assets (like CSS) unversioned.
        const newFileName = isJavaScriptFile(fileNameWithoutVersion)
          ? addVersionTag(fileNameWithoutVersion, versionToUse)
          : fileNameWithoutVersion
        if (newFileName !== normalizedOld) {
          renameMap.set(normalizedOld, newFileName)
        }

        nextState[key] = {
          hash: contentHash,
          version: versionToUse,
          fileName: newFileName
        }
      }

      for (const [oldName, newName] of renameMap.entries()) {
        const output = bundle[oldName]
        if (!output) continue
        output.fileName = newName
        bundle[newName] = output
        delete bundle[oldName]
      }

      if (renameMap.size === 0) return

      const textReplaceMap = new Map()
      const addTextReplacement = (from, to) => {
        if (!from || !to || from === to) return
        textReplaceMap.set(from, to)
      }

      for (const [oldName, newName] of renameMap.entries()) {
        addTextReplacement(oldName, newName)
        addTextReplacement(`/${oldName}`, `/${newName}`)

        const oldBaseName = stripAssetsPrefix(oldName)
        const newBaseName = stripAssetsPrefix(newName)
        addTextReplacement(oldBaseName, newBaseName)
        addTextReplacement(`./${oldBaseName}`, `./${newBaseName}`)
      }

      const replacePattern = [...textReplaceMap.keys()]
        .sort((a, b) => b.length - a.length)
        .map((name) => escapeRegExp(name))
        .join('|')
      const matcher = replacePattern ? new RegExp(replacePattern, 'g') : null

      const replaceInText = (text) => {
        if (!matcher || !text) return text
        return text.replace(matcher, (found) => textReplaceMap.get(found) || found)
      }

      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk') {
          item.imports = (item.imports || []).map((name) => renameMap.get(name) || name)
          item.dynamicImports = (item.dynamicImports || []).map((name) => renameMap.get(name) || name)
          item.implicitlyLoadedBefore = (item.implicitlyLoadedBefore || []).map(
            (name) => renameMap.get(name) || name
          )
          item.code = replaceInText(item.code)
          continue
        }

        if (typeof item.source === 'string' && isTextAsset(item.fileName)) {
          item.source = replaceInText(item.source)
        }
      }
    },
    closeBundle() {
      const statePath = path.join(rootDir, versionStateFile)
      fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2), 'utf8')
    }
  }
}

export default defineConfig({
  plugins: [react(), selectiveVersionPlugin(buildVersion)],
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  }
})
