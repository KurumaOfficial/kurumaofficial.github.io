import { createPublicSite } from './components/public-site.js?v=20260318e';
import { createEditorController } from './admin/editor.js?v=20260318e';
import { createLocaleController } from './i18n/locale-controller.js?v=20260318e';

export async function bootstrap() {
    const localeController = createLocaleController();
    const publicSite = createPublicSite({ localeController });
    const editor = createEditorController({ publicSite });
    publicSite.setupGlobalUi();
    await editor.initialize();
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        await bootstrap();
    });
}
