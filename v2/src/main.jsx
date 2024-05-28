import { createRoot } from 'react-dom/client';

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<h1>Hello, v2</h1>);


console.log("lastfm-to-csv")


if (DEV) new EventSource("/esbuild").addEventListener("change", () => location.reload());
