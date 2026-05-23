// @ts-nocheck
import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stokiloo-black flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-stokiloo-rose/10 border border-stokiloo-rose/20 flex items-center justify-center mb-6">
            <span className="text-stokiloo-rose font-bold text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-display text-stokiloo-white mb-2">Something went wrong</h1>
          <p className="text-stokiloo-grey mb-6 max-w-md text-sm">An unexpected error occurred</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
            className="bg-stokiloo-gold text-stokiloo-black px-6 py-2 text-sm font-medium hover:bg-stokiloo-gold-light transition-colors"
          >
            Go Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
