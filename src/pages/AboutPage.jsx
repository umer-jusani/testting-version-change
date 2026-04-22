import SampleInfo from '../components/SampleInfo.jsx'
import { getSampleMessage } from '../utils/index.js'
import ContactPage from './ContactPage.jsx'

function AboutPage() {
  return (
    <>
      <h2>About Pagss</h2>
      <SampleInfo
        title="About Shared Component"
        text="Yeh reusable component About aur Contact dono pages me use ho raha hai."
      />

      <ContactPage />
      <p>{getSampleMessage('About Page')}</p>
    </>
  )
}

export default AboutPage
