export const SITE_DATA_MODULE_PATH = 'src/data/site-data.js';
export const SITE_DATA_BLOCK_START = '/*__ALEPH_SITE_DATA_START__*/';
export const SITE_DATA_BLOCK_END = '/*__ALEPH_SITE_DATA_END__*/';
export const LOCAL_DATA_KEY = 'ALEPH_SITE_DATA_LOCAL';
export const GITHUB_SYNC_DEFAULTS = Object.freeze({
    owner: 'KurumaOfficial',
    repo: 'kurumaofficial.github.io',
    branch: 'main',
    path: SITE_DATA_MODULE_PATH
});
export const GITHUB_CONTENTS_MAX_FILE_BYTES = 100 * 1024 * 1024;
export const SECRET_SEQUENCE = ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowRight'];
export const HTML_PATH_PATTERN = /\.html?$/i;
export const JS_PATH_PATTERN = /\.js$/i;
export const JSON_PATH_PATTERN = /\.json$/i;
export const SITE_DATA_BLOCK_PATTERN = /[ \t]*\/\*__ALEPH_SITE_DATA_START__\*\/[\s\S]*?[ \t]*\/\*__ALEPH_SITE_DATA_END__\*\//;
export const FLAG_META = {
    alpha: { label: 'Alpha', className: 'is-alpha' },
    beta: { label: 'Beta', className: 'is-beta' },
    release: { label: 'Release', className: 'is-release' }
};
export const ADMIN_VIEW_COPY = {
    home: {
        title: 'Главная',
        subtitle: 'Центр управления черновиком, публикацией и быстрыми переходами по админке.'
    },
    products: {
        title: 'Мои товары',
        subtitle: 'Управление карточками товаров, ссылками и публикацией.'
    },
    supporters: {
        title: 'Поддержавшие',
        subtitle: 'Карточки людей, поддержавших проект. Отображаются на сайте без описания — только имя, роль и аватар.'
    },
    misc: {
        title: 'Прочее',
        subtitle: 'Команда, социальные ссылки и дополнительные настройки сайта.'
    }
};
export const SOCIAL_META = [
    { key: 'youtube', label: 'YouTube' },
    { key: 'discord', label: 'Discord' },
    { key: 'telegram', label: 'Telegram' }
];
