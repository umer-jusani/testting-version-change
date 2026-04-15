import { Component } from 'react'
import { fetchManifestAndLog } from '../utils/manifest.js'

class LazyLoadErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy load error boundary caught:', error, errorInfo)
    fetchManifestAndLog()
  }

  render() {
    if (this.state.hasError) {
      return <p>Page load failed. Check console for details.</p>
    }

    return this.props.children
  }
}

export default LazyLoadErrorBoundary
