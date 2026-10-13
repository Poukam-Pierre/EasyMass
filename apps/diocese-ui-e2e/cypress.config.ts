import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: { default: 'nx run diocese-ui:start' },
      ciWebServerCommand: 'nx run diocese-ui:serve-static',
    }),
    baseUrl: 'http://localhost:3000',
  },
});
