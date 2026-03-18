# GitHub Pages

Этот проект должен продолжать работать как обычный статический сайт на GitHub Pages без сборщика и без серверной логики.

## Что обеспечивает совместимость

- Все ссылки в `index.html` относительные.
- JavaScript использует ES modules, которые GitHub Pages отдаёт как обычные статические файлы.
- CSS подключается через `assets/css/main.css`, а дальше уже импортирует `public.css` и `admin.css`.
- `.nojekyll` отключает Jekyll-обработку, чтобы каталоги вроде `src/` и `assets/` отдавались как есть.

## Важные пути

Стабильные пути проекта:

- `./assets/css/main.css`
- `./src/app.js`
- `./src/data/site-data.js`
- `./assets/files/...`

Если менять их без необходимости, легко сломать:

- загрузку сайта;
- локальный dev workflow;
- публикацию через GitHub token;
- совместимость старых ссылок на `website.html`.

## Как работает публикация из админки

По умолчанию админка публикует:

```text
src/data/site-data.js
```

Дополнительно, если у товара выбран файл:

- файл сначала отправляется в репозиторий через GitHub Contents API;
- затем обновляются данные сайта;
- потом редактор сохраняет новое состояние локально.

Требуемый доступ токена:

```text
Contents: Read and write
```

## Почему publish-target теперь не HTML

Раньше контент жил внутри HTML-файла. После рефакторинга он вынесен в `src/data/site-data.js`, чтобы:

- сократить риск конфликтов при правках layout;
- отделить контент от шаблона страницы;
- упростить поддержку админки;
- не вводить сборку только ради данных.

При этом логика publisher по-прежнему понимает `.html` и `.json`, но штатный рабочий путь проекта сейчас один: `src/data/site-data.js`.

## Минимальная проверка перед публикацией

1. Из корня опубликованной раскладки запусти `node scripts/dev-server.mjs`.
2. Убедись, что грузятся `index.html`, `main.css`, `public.css`, `admin.css` и `src/app.js`.
3. Проверь секретный вход в админку.
4. Убедись, что вкладка `Главная` открывается первой и показывает глобальные действия.
5. Проверь `Применить`, `Отменить` и `Сохранить локально`.
6. Только после этого тестируй `Сохранить для всех`.

## Что не стоит менять без причины

- `index.html` как основной entrypoint.
- `website.html` redirect.
- `assets/css/main.css` как стабильный внешний CSS-путь.
- `src/data/site-data.js` как штатный файл контента.
- относительные пути вида `./...`.

Если один из этих контрактов всё же меняется, синхронно обнови:

- `src/core/constants.js`
- `src/github/publisher.js`
- `README.md`
- документы в `docs/`

## Locale routing

GitHub Pages now serves these public routes:

- `/`
- `/ru/`
- `/en/`
- `/uk/`

Important compatibility notes:

- nested locale routes use generated `index.html` files inside `ru/`, `en/`, `uk/`
- these route files are regenerated from the shared root shell by `node scripts/sync-localized-routes.mjs`
- dynamic local asset links are rewritten at runtime so downloads still resolve correctly from nested routes
