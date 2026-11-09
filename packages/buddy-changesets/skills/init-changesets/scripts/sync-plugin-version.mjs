#!/usr/bin/env node
// Copy each plugin package's package.json version into its plugin manifests and into the
// repository's marketplace catalog entries that point at it. Run after `changeset version`.
//
//   node scripts/sync-plugin-version.mjs [package-dir ...]   (default: .)
//
// Only files that already exist are touched, and only their `version` fields change.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const MANIFESTS = [
	'plugin.json',
	'.claude-plugin/plugin.json',
	'.cursor-plugin/plugin.json',
	'.codex-plugin/plugin.json',
	'.github/plugin/plugin.json',
]

const CATALOGS = [
	'.claude-plugin/marketplace.json',
	'.cursor-plugin/marketplace.json',
	'.agents/plugins/marketplace.json',
	'.github/plugin/marketplace.json',
]

const root = findRoot(process.cwd())
const packageDirs = (process.argv.length > 2 ? process.argv.slice(2) : ['.']).map((dir) => resolve(dir))
const changed = []

const versions = new Map()
for (const dir of packageDirs) {
	const { version } = readJson(join(dir, 'package.json')).data
	if (!version) throw new Error(`${join(dir, 'package.json')} has no version`)
	versions.set(dir, version)
	for (const file of MANIFESTS) {
		update(join(dir, file), (json) => {
			if (json.version === version) return false
			json.version = version
			return true
		})
	}
}

for (const file of CATALOGS) {
	const catalogPath = join(root, file)
	update(catalogPath, (json) => {
		let dirty = false
		for (const entry of json.plugins ?? []) {
			if (typeof entry.source !== 'string' || !('version' in entry)) continue
			const version = versions.get(resolve(root, entry.source))
			if (version && entry.version !== version) {
				entry.version = version
				dirty = true
			}
		}
		return dirty
	})
}

for (const file of changed) console.log(`updated ${file}`)

function update(path, mutate) {
	if (!existsSync(path)) return
	const { data, indent, newline } = readJson(path)
	if (!mutate(data)) return
	writeFileSync(path, JSON.stringify(data, null, indent) + newline)
	changed.push(path)
}

function readJson(path) {
	const text = readFileSync(path, 'utf8')
	const indent = text.match(/^[ \t]+/m)?.[0] ?? '\t'
	return { data: JSON.parse(text), indent, newline: text.endsWith('\n') ? '\n' : '' }
}

function findRoot(start) {
	let dir = start
	while (!existsSync(join(dir, '.git'))) {
		const parent = dirname(dir)
		if (parent === dir) return start
		dir = parent
	}
	return dir
}
