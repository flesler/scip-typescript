import { test } from 'uvu'
import * as assert from 'uvu/assert'

import * as path from 'path'

import * as ts from 'typescript'

import { ProjectOptions } from './CommandLineOptions'
import {
  languageForFileName,
  prettyMilliseconds,
  resolveIndexRootNames,
} from './ProjectIndexer'

function minute(x: number): number {
  return x * 60 * 1000
}
function second(x: number): number {
  return x * 1000
}

test('prettyMilliseconds', () => {
  assert.is(prettyMilliseconds(0), '0ms')
  assert.is(prettyMilliseconds(1), '1ms')
  assert.is(prettyMilliseconds(second(1)), '1s 0ms')
  assert.is(prettyMilliseconds(second(1) + 300), '1s 300ms')
  assert.is(prettyMilliseconds(second(2)), '2s 0ms')
  assert.is(prettyMilliseconds(second(5)), '5s 0ms')
  assert.is(prettyMilliseconds(minute(1)), '1m 0s 0ms')
  assert.is(prettyMilliseconds(minute(2)), '2m 0s 0ms')
  assert.is(prettyMilliseconds(minute(5)), '5m 0s 0ms')
  assert.is(prettyMilliseconds(minute(60)), '60m 0s 0ms')
  assert.is(prettyMilliseconds(minute(5) + second(8) + 999), '5m 8s 999ms')
})

test('resolveIndexRootNames uses subset when --files is set', () => {
  const cwd = '/repo'
  const config: ts.ParsedCommandLine = {
    options: {},
    fileNames: [
      path.join(cwd, 'src/a.ts'),
      path.join(cwd, 'src/b.ts'),
      path.join(cwd, 'src/c.ts'),
    ],
    errors: [],
  }
  const base: ProjectOptions = {
    cwd,
    projectRoot: '.',
    projectDisplayName: 'test',
    writeIndex: () => {},
    inferTsconfig: false,
    progressBar: false,
    yarnWorkspaces: false,
    yarnBerryWorkspaces: false,
    pnpmWorkspaces: false,
    globalCaches: false,
    output: 'index.scip',
    indexedProjects: new Set(),
    files: [],
  }
  assert.equal(resolveIndexRootNames(config, base), config.fileNames)
  const partial = resolveIndexRootNames(config, {
    ...base,
    files: ['src/a.ts', 'src/c.ts'],
  })
  assert.equal(partial, [
    path.join(cwd, 'src/a.ts'),
    path.join(cwd, 'src/c.ts'),
  ])
})

test('languageForFileName', () => {
  assert.is(languageForFileName('index.ts'), 'TypeScript')
  assert.is(languageForFileName('index.mts'), 'TypeScript')
  assert.is(languageForFileName('index.cts'), 'TypeScript')
  assert.is(languageForFileName('index.tsx'), 'TypeScriptReact')
  assert.is(languageForFileName('index.js'), 'JavaScript')
  assert.is(languageForFileName('index.mjs'), 'JavaScript')
  assert.is(languageForFileName('index.cjs'), 'JavaScript')
  assert.is(languageForFileName('index.jsx'), 'JavaScriptReact')
  assert.is(languageForFileName('package.json'), 'JSON')
  assert.is(languageForFileName('Component.svelte'), undefined)
})

test.run()
