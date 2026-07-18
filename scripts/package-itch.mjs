import { spawnSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ZipArchive } from 'archiver'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(projectRoot, 'dist')
const releaseDir = resolve(projectRoot, 'release')
const zipPath = resolve(releaseDir, 'zine-maker-itch.zip')

function run(command) {
  const result = spawnSync(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    // itch.io serves the build from a nested iframe path, so assets must load relatively.
    env: { ...process.env, VITE_BASE_PATH: './' },
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

async function zipDist() {
  await rm(releaseDir, { recursive: true, force: true })
  await mkdir(releaseDir, { recursive: true })

  await new Promise((resolvePromise, rejectPromise) => {
    const output = createWriteStream(zipPath)
    const archive = new ZipArchive({ zlib: { level: 9 } })

    output.on('close', resolvePromise)
    archive.on('error', rejectPromise)

    archive.pipe(output)
    // index.html must sit at the zip root for itch.io to launch it.
    archive.directory(distDir, false)
    archive.finalize()
  })
}

async function main() {
  const distStat = await stat(distDir).catch(() => null)
  if (distStat) {
    await rm(distDir, { recursive: true, force: true })
  }

  run('npm run build')
  await zipDist()

  const { size } = await stat(zipPath)
  console.log(`\nitch.io package ready: ${zipPath} (${(size / 1024).toFixed(1)} KB)`)
  console.log('Upload this zip on itch.io and enable "This file will be played in the browser".')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
