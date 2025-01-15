import { defineConfig } from "vite";
import electron from 'vite-plugin-electron/simple'

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()
    ,electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'electron/main.ts',
      },
      
      
    }),
  ],
  base: "./",

  optimizeDeps: {},
});
