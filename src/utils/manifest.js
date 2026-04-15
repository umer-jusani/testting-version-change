export async function fetchManifestAndLog() {
  const manifestPaths = ['/manifest.json', '/dist/manifest.json']

  for (const manifestPath of manifestPaths) {
    try {
      const response = await fetch(manifestPath)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${manifestPath}: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Manifest content from ${manifestPath}:`, data)
      return data
    } catch (error) {
      console.error(`Manifest fetch error for ${manifestPath}:`, error)
    }
  }

  return null
}

export async function retryImportFromManifest(manifestKey, importError) {
  const manifest = await fetchManifestAndLog()
  const manifestEntry = manifest?.[manifestKey]

  if (!manifestEntry?.file) {
    throw importError
  }

  const retryPath = `/${manifestEntry.file}`
  console.log(`Retrying lazy page from manifest for ${manifestKey}:`, retryPath)

  return import(/* @vite-ignore */ retryPath)
}

export async function importWithManifestRetry(importer, manifestKey) {
  try {
    return await importer()
  } catch (error) {
    console.error(`Lazy import failed for ${manifestKey}:`, error)
    return retryImportFromManifest(manifestKey, error)
  }
}
