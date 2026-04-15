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
