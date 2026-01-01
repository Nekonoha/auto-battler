<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  /* Base Colors (75%) */
  --color-bg-primary: #1a1d29;
  --color-bg-secondary: #23262f;
  --color-bg-tertiary: #2c3038;
  --color-text-primary: #e8eaed;
  --color-text-secondary: #9aa0a6;
  
  /* Accent Colors (20%) */
  --color-accent-primary: #4a9eff;
  --color-accent-secondary: #6b7ff5;
  
  /* Highlight Colors (5%) */
  --color-highlight: #ffb800;
  --color-success: #00c853;
  --color-danger: #ff3b30;
  
  /* Borders & Dividers */
  --color-border: #383b45;
  --color-divider: #2f3239;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--color-bg-primary);
  min-height: 100vh;
  color: var(--color-text-primary);
  line-height: 1.6;
}
</style>
