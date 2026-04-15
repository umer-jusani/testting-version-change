import { getSampleMessage } from '../utils/index.js'

function HomePage() {
  return (
    <>
      <h2>Home Page</h2>
      <p>{getSampleMessage('Home Page')}</p>
    </>
  )
}

export default HomePage
