import {defineConfig,devices} from '@playwright/test';
// CROSS=1 adds Firefox and WebKit projects (install with `npx playwright install firefox webkit`).
const cross=process.env.CROSS?[{name:'firefox',use:{...devices['Desktop Firefox']}},{name:'webkit',use:{...devices['Desktop Safari']}}]:[];
export default defineConfig({
 testDir:'./tests/browser',
 timeout:60000,
 use:{baseURL:process.env.BASE_URL||'http://localhost:3000',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome'],launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}}},...cross],
 webServer:process.env.BASE_URL?undefined:{command:'npm run dev',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:120000},
});
