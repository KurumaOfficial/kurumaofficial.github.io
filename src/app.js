import { createPublicSite } from './components/public-site.js';
import { createEditorController } from './admin/editor.js';

export async function bootstrap() {
    const publicSite = createPublicSite();
    const editor = createEditorController({ publicSite });
    publicSite.setupGlobalUi();
    await editor.initialize();
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        await bootstrap();
    });
}
