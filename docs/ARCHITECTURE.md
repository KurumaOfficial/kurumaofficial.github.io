# Architecture

Документ описывает текущее устройство сайта после разбиения монолита. Здесь нет сборщика и нет серверной части: вся схема рассчитана на статическую отдачу через GitHub Pages.

## Слои

### Entry layer

- `index.html` содержит только HTML-структуру страницы, inline SVG-символы и подключения ресурсов.
- `website.html` больше не дублирует приложение и служит redirect-обёрткой на `index.html`.

### CSS layer

- `assets/css/main.css` — стабильный публичный entrypoint.
- `assets/css/public.css` — стили витрины и публичных секций.
- `assets/css/admin.css` — стили скрытой админки.

Почему так:

- `index.html` продолжает ссылаться только на один CSS-файл.
- public/admin стили физически разделены, так что их можно править независимо.

### JavaScript layer

- `src/app.js` — bootstrap приложения.
- `src/components/public-site.js` — рендер витрины, каталога, команды, соцссылок, toast и визуальных эффектов.
- `src/admin/editor.js` — состояние редактора, Home-dashboard, формы, черновик, localStorage, секретный вход и orchestration UI.
- `src/github/publisher.js` — изолированная логика работы с GitHub Contents API.
- `src/core/constants.js` и `src/core/site-utils.js` — общий слой констант и чистых утилит.

## Data flow

Основной источник данных:

```text
src/data/site-data.js
```

Текущая схема:

1. При загрузке сайт импортирует встроенные данные из `src/data/site-data.js`.
2. Если в браузере есть локальный черновик, он перекрывает встроенные данные.
3. Админка редактирует `editorData`.
4. Поля во вкладках `Товары` и `Прочее` сразу синхронизируются в `editorData`, без отдельной кнопки применения формы.
5. Вкладка `Главная` показывает текущее состояние черновика и глобальные действия.
6. `Применить` переносит draft в preview-состояние страницы.
7. `Сохранить локально` записывает нормализованные данные в `localStorage`.
8. `Сохранить для всех` сначала загружает выбранные файлы товара в репозиторий, затем обновляет `src/data/site-data.js`.

## Почему данные хранятся в JS-модуле

Контент хранится не в `json`, а в `src/data/site-data.js`, потому что:

- публикация должна работать прямо из браузера;
- GitHub Pages должен оставаться без сборщика;
- админка должна обновлять один известный файл через Contents API;
- layout и контент должны быть разделены.

## Что важно не ломать

- `index.html` как основной entrypoint.
- `assets/css/main.css` как стабильный внешний CSS-путь.
- `src/data/site-data.js` как основную точку публикации контента.
- относительные пути вида `./assets/...` и `./src/...`.
- секретную последовательность входа в админку.

## Безопасные точки расширения

Если изменения локальны, правь соответствующий слой:

- `assets/css/public.css` — если меняется только публичный визуал.
- `assets/css/admin.css` — если меняется только UI панели.
- `src/components/public-site.js` — если меняется только публичный рендер.
- `src/admin/editor.js` — если меняется только UX админки.
- `src/data/site-data.js` — если меняется только контент.

## Locale routes

The public shell now supports route-based locales:

- `/` remains the legacy Russian entrypoint
- `/ru/`, `/en/`, `/uk/` are explicit locale routes
- the header language dropdown navigates between routes instead of using query params

Locale-specific code lives in:

- `src/i18n/config.js`
- `src/i18n/messages.js`
- `src/i18n/localized-content.js`
- `src/i18n/locale-controller.js`
- `scripts/sync-localized-routes.mjs`
