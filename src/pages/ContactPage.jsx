import SampleInfo from '../components/SampleInfo.jsx'
import { getSampleMessage } from '../utils/index.js'

function ContactPage() {
  return (
    <>
      <h2>Contacts Pagess</h2>
      <SampleInfo
        title="Contact Shared Component"
        text="Same sample component yahan bhi import hua hai for reuse."
      />
      <p>{getSampleMessage('Contact Page')}</p>
    </>
  )
}

export default ContactPage
