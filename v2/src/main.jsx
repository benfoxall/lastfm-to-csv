import './main.css';
import { createRoot } from 'react-dom/client';
import { App } from './App'

document.body.innerHTML = '<div id="app"></div>';

const root = createRoot(document.getElementById('app'));
root.render(<App />);

console.log("lastfm-to-csv")

if (DEV) {
    new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
