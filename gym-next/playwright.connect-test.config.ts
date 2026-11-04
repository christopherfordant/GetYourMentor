import {defineConfig} from '@playwright/test';
import base from './playwright.config';
// Explicit local runner; do not overwrite an existing unrelated Playwright config.
export default defineConfig({...base,webServer:undefined,use:{...base.use,baseURL:'http://127.0.0.1:3005'}});
