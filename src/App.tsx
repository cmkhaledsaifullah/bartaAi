import './App.css'

const commands = [
  { label: 'Start dev server', command: 'npm run dev' },
  { label: 'Create production build', command: 'npm run build' },
  { label: 'Preview production build', command: 'npm run preview' },
]

const deploymentNotes = [
  'Serve the contents of the dist folder from any static host (Vercel, Netlify, S3, nginx, etc.).',
  'Set the VITE_APP_* environment variables at build time to expose runtime configuration when needed.',
  'Use the --host flag on npm run dev to expose the dev server to your local network for device testing.',
]

function App() {
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">BartaAI Starter</p>
        <h1>React + Vite boilerplate</h1>
        <p>
          Ready-to-ship React app configured with Vite, TypeScript, and npm scripts for both local
          development and production hosting.
        </p>
      </section>

      <section className="commands">
        {commands.map(({ label, command }) => (
          <article key={label}>
            <p className="label">{label}</p>
            <code>{command}</code>
          </article>
        ))}
      </section>

      <section className="deployment">
        <h2>Hosting checklist</h2>
        <ul>
          {deploymentNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
