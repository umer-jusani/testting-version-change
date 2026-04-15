import { useEffect } from 'react'
import SampleInfo from '../components/SampleInfo.jsx'
import { getSampleMessage } from '../utils/index.js'

function AboutPage() {
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch('/manifest.json')
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.status}`)
        }

        const data = await response.json()
        console.log('Manifest content:', data)
      } catch (error) {
        console.error('Manifest fetch error:', error)
      }
    }

    loadManifest()
  }, [])

  return (
    <>
      <h2>About Page</h2>
      <SampleInfo
        title="About Shared Component"
        text="Yeh reusable component About aur Contact dono pages me use ho raha hai."
      />
      <p>{getSampleMessage('About Page')}</p>
    </>
  )
}

export default AboutPage
