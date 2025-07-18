@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.leaflet-container {
  height: 100vh;
  width: 100%;
}

/* Winter Mode Theme */
.winter {
  background: linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%) !important;
  color: #1e3a8a !important;
}
.winter .bg-white,
.winter .bg-gray-50 {
  background: #e0f2fe !important;
  color: #1e3a8a !important;
}
.winter .text-gray-800,
.winter .text-gray-600 {
  color: #1e3a8a !important;
}
.winter .bg-blue-600 {
  background: #2563eb !important;
}
.winter .shadow-lg {
  box-shadow: 0 8px 32px 0 rgba(30, 58, 138, 0.15) !important;
}

/* Snowflake Animation */
.snowflakes {
  pointer-events: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  overflow: hidden;
  z-index: 2000;
}
.snowflake {
  position: absolute;
  top: -2em;
  color: #e0e7ef;
  font-size: 2em;
  opacity: 0.8;
  user-select: none;
  animation: snowflakes-fall 10s linear infinite;
  left: calc(100vw * var(--snow-x, 0.5));
  animation-delay: calc(-10s * var(--snow-delay, 0));
}
.snowflake:nth-child(1) { --snow-x: 0.05; --snow-delay: 0.1; }
.snowflake:nth-child(2) { --snow-x: 0.10; --snow-delay: 0.2; }
.snowflake:nth-child(3) { --snow-x: 0.15; --snow-delay: 0.3; }
.snowflake:nth-child(4) { --snow-x: 0.20; --snow-delay: 0.4; }
.snowflake:nth-child(5) { --snow-x: 0.25; --snow-delay: 0.5; }
.snowflake:nth-child(6) { --snow-x: 0.30; --snow-delay: 0.6; }
.snowflake:nth-child(7) { --snow-x: 0.35; --snow-delay: 0.7; }
.snowflake:nth-child(8) { --snow-x: 0.40; --snow-delay: 0.8; }
.snowflake:nth-child(9) { --snow-x: 0.45; --snow-delay: 0.9; }
.snowflake:nth-child(10) { --snow-x: 0.50; --snow-delay: 1.0; }
.snowflake:nth-child(11) { --snow-x: 0.55; --snow-delay: 1.1; }
.snowflake:nth-child(12) { --snow-x: 0.60; --snow-delay: 1.2; }
.snowflake:nth-child(13) { --snow-x: 0.65; --snow-delay: 1.3; }
.snowflake:nth-child(14) { --snow-x: 0.70; --snow-delay: 1.4; }
.snowflake:nth-child(15) { --snow-x: 0.75; --snow-delay: 1.5; }
.snowflake:nth-child(16) { --snow-x: 0.80; --snow-delay: 1.6; }
.snowflake:nth-child(17) { --snow-x: 0.85; --snow-delay: 1.7; }
.snowflake:nth-child(18) { --snow-x: 0.90; --snow-delay: 1.8; }
.snowflake:nth-child(19) { --snow-x: 0.95; --snow-delay: 1.9; }
.snowflake:nth-child(20) { --snow-x: 1.00; --snow-delay: 2.0; }
/* Repeat for more snowflakes if needed */
@keyframes snowflakes-fall {
  0% { transform: translateY(-2em) rotate(0deg); opacity: 0.8; }
  80% { opacity: 0.8; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0.2; }
} 

/* Google Translate dropdown fix: make language list scrollable */
.goog-te-menu-frame.skiptranslate {
  max-height: 60vh !important;
  width: auto !important;
  top: auto !important;
  bottom: 60px !important;
  right: 10px !important;
}
.goog-te-menu2 {
  max-height: 50vh !important;
  overflow-y: auto !important;
} 