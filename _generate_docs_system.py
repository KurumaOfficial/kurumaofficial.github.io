import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

locales = ["ru", "en", "ua"]
categories = ["privacy", "terms", "user-agreement", "cookies", "launcher", "integrity", "network", "faq", "aleph-trust-api", "wetid-auth", "webhooks", "sdk"]

groups = {
    "agreements": ["privacy", "terms", "user-agreement", "cookies"],
    "troubleshooting": ["launcher", "integrity", "network", "faq"],
    "api": ["aleph-trust-api", "wetid-auth", "webhooks", "sdk"]
}

# Localization definitions
meta_data = {
    "ru": {
        "title": "Aleph Studio — Документация",
        "back_label": "НАЗАД К АРХИВУ ДОКУМЕНТОВ",
        "back_aria": "Назад к архиву документов",
        "sidebar_title_rules": "Правила",
        "sidebar_title_issues": "Решение проблем",
        "sidebar_title_api": "API и интеграции",
        "nav_products": "Продукты",
        "nav_donate": "Поддержать",
        "tagline": "Дочерний проект WeTTeA",
        "copyright": "© 2026. Все права защищены.",
        "skip_link": "Перейти к основному содержимому",
        "sidebar_links": {
            "privacy": "Конфиденциальность",
            "terms": "Правила использования",
            "user-agreement": "Пользовательское соглашение",
            "cookies": "Использование Cookies",
            "launcher": "AMCLauncher",
            "integrity": "Целостность модов",
            "network": "Сетевое подключение",
            "faq": "Часто задаваемые вопросы",
            "aleph-trust-api": "API Aleph Trust",
            "wetid-auth": "Авторизация WetID",
            "webhooks": "Настройка Webhooks",
            "sdk": "Примеры интеграции"
        }
    },
    "en": {
        "title": "Aleph Studio — Documentation",
        "back_label": "BACK TO DOCUMENTS ARCHIVE",
        "back_aria": "Back to documents archive",
        "sidebar_title_rules": "Policies",
        "sidebar_title_issues": "Troubleshooting",
        "sidebar_title_api": "API & Integrations",
        "nav_products": "Products",
        "nav_donate": "Support",
        "tagline": "A subsidiary of WeTTeA",
        "copyright": "© 2026. All rights reserved.",
        "skip_link": "Skip to main content",
        "sidebar_links": {
            "privacy": "Privacy Policy",
            "terms": "Terms of Service",
            "user-agreement": "User Agreement",
            "cookies": "Cookies Policy",
            "launcher": "AMCLauncher",
            "integrity": "Mod Integrity",
            "network": "Network Connection",
            "faq": "Frequently Asked Questions",
            "aleph-trust-api": "Aleph Trust API",
            "wetid-auth": "WetID Auth",
            "webhooks": "Webhooks Setup",
            "sdk": "Integration Examples"
        }
    },
    "ua": {
        "title": "Aleph Studio — Документація",
        "back_label": "НАЗАД ДО АРХІВУ ДОКУМЕНТІВ",
        "back_aria": "Назад до архіву документів",
        "sidebar_title_rules": "Угоди та правила",
        "sidebar_title_issues": "Вирішення проблем",
        "sidebar_title_api": "API та інтеграції",
        "nav_products": "Продукти",
        "nav_donate": "Підтримати",
        "tagline": "Дочірній проєкт WeTTeA",
        "copyright": "© 2026. Усі права захищено.",
        "skip_link": "Перейти до основного вмісту",
        "sidebar_links": {
            "privacy": "Конфіденційність",
            "terms": "Правила використання",
            "user-agreement": "Угода користувача",
            "cookies": "Використання Cookies",
            "launcher": "AMCLauncher",
            "integrity": "Цілісність модів",
            "network": "Мережеве підключення",
            "faq": "Часті запитання (FAQ)",
            "aleph-trust-api": "API Aleph Trust",
            "wetid-auth": "Авторизація WetID",
            "webhooks": "Налаштування Webhooks",
            "sdk": "Приклади інтеграції"
        }
    }
}

new_pages_content = {
    "ru": {
        "launcher": """<div class="docs-content">
    <section>
      <h1>Решение проблем с AMCLauncher</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>В данном разделе описаны решения частых ошибок, возникающих при работе с официальным лаунчером AMCLauncher.</p>
    </section>
    <section>
      <h2>1. Лаунчер не запускается</h2>
      <p>Если после запуска ничего не происходит, попробуйте выполнить следующие шаги:</p>
      <ul>
        <li>Убедитесь, что на вашем компьютере установлена Java версии 17 или выше (рекомендуется официальный дистрибутив Eclipse Temurin).</li>
        <li>Проверьте системные обновления Windows/Linux/macOS.</li>
        <li>Добавьте исполняемый файл лаунчера в белый список антивируса и брандмауэра Windows.</li>
      </ul>
    </section>
    <section>
      <h2>2. Низкая производительность (FPS)</h2>
      <p>Для исправления фризов и лагов:</p>
      <p>Откройте настройки лаунчера и выделите игре больше оперативной памяти. Для комфортной игры с модами рекомендуется выставлять <strong>от 4 ГБ до 8 ГБ ОЗУ</strong>. Также убедитесь, что в системе обновлены драйверы видеокарты.</p>
    </section>
</div>""",
        "integrity": """<div class="docs-content">
    <section>
      <h1>Ошибки проверки целостности модов</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Система защиты Aleph Trust производит автоматическую сверку хэш-сумм ваших файлов перед входом на игровые сервера.</p>
    </section>
    <section>
      <h2>1. Ошибка Modset Hash Mismatch</h2>
      <p>Эта ошибка сигнализирует о том, что ваша сборка модов отличается от эталонной на сервере.</p>
      <p>Решение: лаунчер должен автоматически докачать недостающие компоненты. Если этого не произошло, перейдите в настройки профиля в AMCLauncher и выберите <strong>«Принудительно обновить файлы»</strong> для очистки кэша.</p>
    </section>
    <section>
      <h2>2. Модифицированный клиент</h2>
      <p>Любые сторонние инъекции кода, использование чит-модов или запрещенных модов вызовут ошибку проверки.</p>
      <div class="docs-note">
        <strong>Важно:</strong> Для успешной проверки используйте исключительно чистую и официальную сборку сервера.
      </div>
    </section>
</div>""",
        "network": """<div class="docs-content">
    <section>
      <h1>Проблемы с сетевым подключением</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Справочник по решению проблем со связью с серверами авторизации WetID и API Aleph Trust.</p>
    </section>
    <section>
      <h2>1. Тайм-аут подключения (Connection Timeout)</h2>
      <p>Если лаунчер зависает на этапе авторизации:</p>
      <ul>
        <li>Проверьте стабильность вашего интернет-соединения.</li>
        <li>Если вы используете VPN или прокси-сервер, отключите его временно или смените сервер подключения.</li>
        <li>Попробуйте перезагрузить роутер.</li>
      </ul>
    </section>
    <section>
      <h2>2. Блокировка брандмауэром</h2>
      <p>Некоторые защитные программы могут блокировать запросы лаунчера к серверу.</p>
      <p>Решение: Добавьте <code>amclauncher.exe</code> и исполняемый файл Java в список исключений брандмауэра Windows.</p>
    </section>
</div>""",
        "faq": """<div class="docs-content">
    <section>
      <h1>Частно задаваемые вопросы (FAQ)</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Быстрые ответы на часто возникающие вопросы о проектах Aleph Studio.</p>
    </section>
    <section>
      <h2>Как получить доступ к серверам?</h2>
      <p>Для входа на наши сервера требуется учетная запись WetID. После авторизации в AMCLauncher система защиты автоматически проверяет наличие необходимых подписок или верифицированных документов для допуска.</p>
    </section>
    <section>
      <h2>Платные ли продукты?</h2>
      <p>Strange Visuals и AMCLauncher полностью бесплатны для обычных игроков. Aleph Trust представляет собой коммерческую SaaS-систему с платными тарифами (Beth, Gimel, Dalet) только для владельцев и администраторов серверов.</p>
    </section>
</div>""",
        "aleph-trust-api": """<div class="docs-content">
    <section>
      <h1>API Документация Aleph Trust</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Описание веб-интерфейса интеграции системы защиты для ваших Minecraft серверов.</p>
    </section>
    <section>
      <h2>1. Базовый URL</h2>
      <p>Все запросы выполняются по протоколу HTTPS к адресу: <code>https://api.aleph.icu/v1/trust/</code></p>
    </section>
    <section>
      <h2>2. Проверка сессии игрока</h2>
      <p>Для валидации токена авторизации игрока при подключении к вашему серверу отправьте GET запрос:</p>
      <p><strong>Запрос:</strong> <code>GET /session/verify?username={username}&amp;token={token}</code></p>
      <p><strong>Ответ (JSON):</strong></p>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">{
  "isValid": true,
  "trustFactor": 80,
  "wetid": "user@aleph.icu"
}</pre>
    </section>
</div>""",
        "wetid-auth": """<div class="docs-content">
    <section>
      <h1>Авторизация через WetID</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p> WetID предоставляет удобный сервис авторизации игроков по протоколу OAuth 2.0.</p>
    </section>
    <section>
      <h2>1. Регистрация приложения</h2>
      <p>Чтобы интегрировать вход через WetID на свой сайт, перейдите в панель разработчика в своем аккаунте WetID, создайте приложение и настройте параметры Client ID, Client Secret и Redirect URI.</p>
    </section>
    <section>
      <h2>2. Протокол OAuth 2.0</h2>
      <p>Перенаправьте пользователя на: <code>https://wetid.aleph.icu/oauth/authorize?response_type=code&amp;client_id=YOUR_CLIENT_ID</code>. После подтверждения пользователь вернется с кодом авторизации, который вы сможете обменять на токен доступа на бэкенде.</p>
    </section>
</div>""",
        "webhooks": """<div class="docs-content">
    <section>
      <h1>Настройка Webhooks</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Инструкции по настройке мгновенных вебхуков для логирования действий безопасности.</p>
    </section>
    <section>
      <h2>1. Логирование в Discord</h2>
      <p>Вы можете получать отчеты о каждой заблокированной попытке входа на сервер прямо в ваш Discord-канал.</p>
      <p>Для этого создайте вебхук в настройках канала Discord, скопируйте его URL и вставьте в разделе <strong>«Уведомления»</strong> панели управления Aleph Trust.</p>
    </section>
    <section>
      <h2>2. События безопасности</h2>
      <p>Доступны для подписки события: <code>session.created</code> (успешный вход), <code>session.denied</code> (отклоненный вход с указанием причины), <code>trust.anomaly</code> (подозрительное изменение Trust Factor).</p>
    </section>
</div>""",
        "sdk": """<div class="docs-content">
    <section>
      <h1>Примеры интеграции (SDK)</h1>
      <div class="docs-update-date">Последнее обновление: 5 июля 2026</div>
      <p>Репозиторий библиотек и примеров кода для быстрого старта интеграции.</p>
    </section>
    <section>
      <h2>1. Spigot/Paper Minecraft Plugin</h2>
      <p>Используйте наш официальный плагин-коннектор для интеграции проверки сессий во время события <code>AsyncPlayerPreLoginEvent</code>. Исходный код и примеры конфигурации выложены на GitHub.</p>
    </section>
    <section>
      <h2>2. Библиотека Node.js</h2>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">const { TrustClient } = require('@aleph-icu/trust-sdk');
const client = new TrustClient({ apiKey: 'YOUR_KEY' });
const res = await client.verifySession('User', 'token');</pre>
    </section>
</div>"""
    },
    "en": {
        "launcher": """<div class="docs-content">
    <section>
      <h1>AMCLauncher Troubleshooting</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>This section describes fixes for common issues encountered when running the official AMCLauncher.</p>
    </section>
    <section>
      <h2>1. Launcher won't start</h2>
      <p>If nothing happens after launching, try the following steps:</p>
      <ul>
        <li>Ensure you have Java 17 or higher installed (Eclipse Temurin is highly recommended).</li>
        <li>Check for pending Windows/Linux/macOS system updates.</li>
        <li>Add the launcher executable to your antivirus and Windows Firewall exclusion list.</li>
      </ul>
    </section>
    <section>
      <h2>2. Low Performance (FPS)</h2>
      <p>To resolve lag and freezing:</p>
      <p>Open the launcher settings and allocate more RAM to the game. For playing with mods, we recommend allocating <strong>at least 4 GB to 8 GB of RAM</strong>. Also, check that your GPU drivers are up to date.</p>
    </section>
</div>""",
        "integrity": """<div class="docs-content">
    <section>
      <h1>Mod Integrity Verification Errors</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>The Aleph Trust protection system automatically validates the hash values of your modset before granting access to the game servers.</p>
    </section>
    <section>
      <h2>1. Modset Hash Mismatch</h2>
      <p>This error indicates that your loaded mods differ from the server's mod pack configuration.</p>
      <p>Fix: The launcher should automatically redownload missing mods. If it fails, open your profile settings in AMCLauncher and select <strong>"Force update files"</strong> to clear the cache.</p>
    </section>
    <section>
      <h2>2. Modified Client Detected</h2>
      <p>Any custom code injections, cheat mods, or unauthorized modifications will trigger a verification error.</p>
      <div class="docs-note">
        <strong>Important:</strong> To successfully pass verification, use only the clean and official server modpack files.
      </div>
    </section>
</div>""",
        "network": """<div class="docs-content">
    <section>
      <h1>Network Connection Issues</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>Troubleshooting connection issues with WetID auth servers and the Aleph Trust API endpoint.</p>
    </section>
    <section>
      <h2>1. Connection Timeout</h2>
      <p>If the launcher hangs at the authorization phase:</p>
      <ul>
        <li>Verify your internet connection stability.</li>
        <li>If you use a VPN or proxy, disable it temporarily or choose a different connection location.</li>
        <li>Try restarting your router.</li>
      </ul>
    </section>
    <section>
      <h2>2. Firewall Blocks</h2>
      <p>Some security software may block outgoing requests from Java or the launcher.</p>
      <p>Fix: Add <code>amclauncher.exe</code> and your Java runtime executable to the Windows Defender Firewall exception rules.</p>
    </section>
</div>""",
        "faq": """<div class="docs-content">
    <section>
      <h1>Frequently Asked Questions (FAQ)</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>Quick answers to common questions about Aleph Studio services.</p>
    </section>
    <section>
      <h2>How do I access the servers?</h2>
      <p>A WetID account is required to log into our servers. Once logged in through AMCLauncher, the system will verify your trust status and documentation to authorize entrance automatically.</p>
    </section>
    <section>
      <h2>Are the products paid?</h2>
      <p>Strange Visuals and AMCLauncher are completely free for players. Aleph Trust is a commercial SaaS product with paid subscription plans (Beth, Gimel, Dalet) meant for server owners and administrators.</p>
    </section>
</div>""",
        "aleph-trust-api": """<div class="docs-content">
    <section>
      <h1>Aleph Trust API Documentation</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>Web API specification for integrating the shield security system into your custom Minecraft servers.</p>
    </section>
    <section>
      <h2>1. Base URL</h2>
      <p>All API queries are served over HTTPS at: <code>https://api.aleph.icu/v1/trust/</code></p>
    </section>
    <section>
      <h2>2. Verify Player Session</h2>
      <p>To validate a player session token during connection, send a GET request from your server backend:</p>
      <p><strong>Request:</strong> <code>GET /session/verify?username={username}&amp;token={token}</code></p>
      <p><strong>Response (JSON):</strong></p>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">{
  "isValid": true,
  "trustFactor": 80,
  "wetid": "user@aleph.icu"
}</pre>
    </section>
</div>""",
        "wetid-auth": """<div class="docs-content">
    <section>
      <h1>Authentication via WetID</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>WetID offers a secure OAuth 2.0 protocol for player profile authentication.</p>
    </section>
    <section>
      <h2>1. App Registration</h2>
      <p>To integrate WetID Login on your website, create a client application in the developer portal within your WetID panel to get your Client ID, Client Secret, and set your Redirect URIs.</p>
    </section>
    <section>
      <h2>2. OAuth 2.0 Flow</h2>
      <p>Redirect users to: <code>https://wetid.aleph.icu/oauth/authorize?response_type=code&amp;client_id=YOUR_CLIENT_ID</code>. Upon authorization, the user will be redirected back with a code, which your backend can exchange for an access token.</p>
    </section>
</div>""",
        "webhooks": """<div class="docs-content">
    <section>
      <h1>Webhooks Configuration</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>Guide to configuring instant webhook callbacks for logging security events.</p>
    </section>
    <section>
      <h2>1. Discord Webhooks</h2>
      <p>Log all blocked unauthorized login attempts directly to your Discord channel.</p>
      <p>Create a webhook in your Discord channel settings, copy the URL, and paste it into the <strong>"Notifications"</strong> tab in your Aleph Trust dashboard.</p>
    </section>
    <section>
      <h2>2. Webhook Event Types</h2>
      <p>Supported callbacks: <code>session.created</code> (login successful), <code>session.denied</code> (login blocked with reason), <code>trust.anomaly</code> (unusual Trust Factor changes).</p>
    </section>
</div>""",
        "sdk": """<div class="docs-content">
    <section>
      <h1>Integration Examples (SDK)</h1>
      <div class="docs-update-date">Last Updated: July 5, 2026</div>
      <p>Software development libraries and code templates for quick integration.</p>
    </section>
    <section>
      <h2>1. Spigot/Paper Minecraft Plugin</h2>
      <p>Use our official Spigot plugin SDK to intercept connections on the <code>AsyncPlayerPreLoginEvent</code>. Source files and guides are hosted on GitHub.</p>
    </section>
    <section>
      <h2>2. Node.js SDK</h2>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">const { TrustClient } = require('@aleph-icu/trust-sdk');
const client = new TrustClient({ apiKey: 'YOUR_KEY' });
const res = await client.verifySession('User', 'token');</pre>
    </section>
</div>"""
    },
    "ua": {
        "launcher": """<div class="docs-content">
    <section>
      <h1>Вирішення проблем з AMCLauncher</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>У цьому розділі опис вирішення поширених проблем, які виникають під час запуску офіційного лаунчера AMCLauncher.</p>
    </section>
    <section>
      <h2>1. Лаунчер не запускається</h2>
      <p>Якщо після кліку на ярлик нічого не відбувається, спробуйте виконати такі дії:</p>
      <ul>
        <li>Переконайтеся, що на вашому комп'ютері встановлена версія Java 17 або вище (рекомендується офіційний збірка Eclipse Temurin).</li>
        <li>Перевірте оновлення операційної системи Windows/Linux/macOS.</li>
        <li>Додайте лаунчер у білий список вашого антивірусу та вбудованого брандмауера Windows.</li>
      </ul>
    </section>
    <section>
      <h2>2. Низька продуктивність (FPS)</h2>
      <p>Для виправлення фризів і лагів:</p>
      <p>Відкрийте налаштування лаунчера і виділіть грі більше оперативної пам'яті. Для стабільної гри з модами рекомендується виділяти <strong>від 4 ГБ до 8 ГБ ОЗУ</strong>. Також переконайтеся, що у системі оновлені драйвери відеокарти.</p>
    </section>
</div>""",
        "integrity": """<div class="docs-content">
    <section>
      <h1>Помилки перевірки цілісності модів</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Система захисту Aleph Trust автоматично звіряє хеш-суми ваших ігрових файлів перед підключенням до ігрових серверів.</p>
    </section>
    <section>
      <h2>1. Помилка Modset Hash Mismatch</h2>
      <p>Ця помилка сигналізує про те, що ваш набір модів відрізняється від встановленого на сервері.</p>
      <p>Вирішення: лаунчер має автоматично завантажити потрібні файли. Якщо цього не сталося, відкрийте налаштування профілю в AMCLauncher та оберіть <strong>«Примусово оновити файли»</strong> для очищення кешу.</p>
    </section>
    <section>
      <h2>2. Модифікований клієнт</h2>
      <p>Будь-які сторонні модифікації коду клієнта або використання чит-клієнтів призведуть до блокування входу системою захисту.</p>
      <div class="docs-note">
        <strong>Важливо:</strong> Для успішного проходження перевірки використовуйте виключно офіційну чисту збірку сервера.
      </div>
    </section>
</div>""",
        "network": """<div class="docs-content">
    <section>
      <h1>Проблеми з мережевим з'єднанням</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Довідник з усунення проблем зв'язку із серверами WetID та API Aleph Trust.</p>
    </section>
    <section>
      <h2>1. Тайм-аут з'єднання (Connection Timeout)</h2>
      <p>Якщо лаунчер зависає на етапі авторизації:</p>
      <ul>
        <li>Перевірте стабільність вашого інтернет-з'єднання.</li>
        <li>Якщо ви використовуєте VPN або проксі, вимкніть його або змініть сервер для підключення.</li>
        <li>Спробуйте перезавантажити роутер.</li>
      </ul>
    </section>
    <section>
      <h2>2. Блокування брандмауером</h2>
      <p>Деякі антивірусні програми можуть перешкоджати мережевій активності лаунчера.</p>
      <p>Вирішення: Додайте <code>amclauncher.exe</code> та Java до виключень брандмауера Windows.</p>
    </section>
</div>""",
        "faq": """<div class="docs-content">
    <section>
      <h1>Часті запитання (FAQ)</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Швидкі відповіді на поширені питання про послуги Aleph Studio.</p>
    </section>
    <section>
      <h2>Як отримати доступ до серверів?</h2>
      <p>Для гри на наших серверах потрібен обліковий запис WetID. Після входу в AMCLauncher наша система безпеки перевірить наявність необхідних ліцензій та рівень вашої довіри (Trust Factor) для надання доступу.</p>
    </section>
    <section>
      <h2>Чи платні продукти?</h2>
      <p>Strange Visuals та AMCLauncher надаються гравцям повністю безкоштовно. Aleph Trust — це комерційний SaaS продукт із платними планами (Beth, Gimel, Dalet) лише для власників та адміністраторів ігрових серверів.</p>
    </section>
</div>""",
        "aleph-trust-api": """<div class="docs-content">
    <section>
      <h1>API Документація Aleph Trust</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Опис веб-сервісу перевірки авторизації гравців для ваших Minecraft серверів.</p>
    </section>
    <section>
      <h2>1. Базова адреса</h2>
      <p>Усі запити виконуються за протоколом HTTPS до адреси: <code>https://api.aleph.icu/v1/trust/</code></p>
    </section>
    <section>
      <h2>2. Валідація сесії гравця</h2>
      <p>Для перевірки токена авторизації гравця під час входу на ваш сервер відправте GET запит:</p>
      <p><strong>Запит:</strong> <code>GET /session/verify?username={username}&amp;token={token}</code></p>
      <p><strong>Відповідь (JSON):</strong></p>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">{
  "isValid": true,
  "trustFactor": 80,
  "wetid": "user@aleph.icu"
}</pre>
    </section>
</div>""",
        "wetid-auth": """<div class="docs-content">
    <section>
      <h1>Авторизація через WetID</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>WetID надає надійний сервіс аутентифікації гравців за протоколом OAuth 2.0.</p>
    </section>
    <section>
      <h2>1. Реєстрація додатку</h2>
      <p>Для інтеграції авторизації WetID на вашому сайті зареєструйте додаток в особистому кабінеті розробника WetID, отримайте параметри Client ID, Client Secret та вкажіть Redirect URI.</p>
    </section>
    <section>
      <h2>2. OAuth 2.0 Протокол</h2>
      <p>Перенаправьте користувача на: <code>https://wetid.aleph.icu/oauth/authorize?response_type=code&amp;client_id=YOUR_CLIENT_ID</code>. Після згоди користувач повернеться з кодом, який ви обміняєте на access token на бэкенді.</p>
    </section>
</div>""",
        "webhooks": """<div class="docs-content">
    <section>
      <h1>Наставляння Webhooks</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Інструкції з налаштування миттєвих сповіщень безпеки через вебхуки.</p>
    </section>
    <section>
      <h2>1. Сповіщення в Discord</h2>
      <p>Ви можете налаштувати автоматичне надсилання сповіщень про спроби входу на ваш сервер у Discord. Вставте URL вебхука в панелі керування.</p>
    </section>
    <section>
      <h2>2. Події безпеки</h2>
      <p>Підтримуються події: <code>session.created</code> (успішний вхід), <code>session.denied</code> (відхилений вхід з причиною), <code>trust.anomaly</code> (підозріла активність Trust Factor).</p>
    </section>
</div>""",
        "sdk": """<div class="docs-content">
    <section>
      <h1>Приклади інтеграції (SDK)</h1>
      <div class="docs-update-date">Останнє оновлення: 5 липня 2026</div>
      <p>Репозиторій клієнтських бібліотек для легкої інтеграції.</p>
    </section>
    <section>
      <h2>1. Spigot/Paper Minecraft Plugin</h2>
      <p>Використовуйте наш офіційний Spigot плагін SDK для перехоплення з'єднань гравців під час події <code>AsyncPlayerPreLoginEvent</code>. Деталі див. на GitHub.</p>
    </section>
    <section>
      <h2>2. Бібліотека Node.js</h2>
      <pre style="background:rgba(0,0,0,0.3); padding:16px; font-family:monospace; color:var(--text); border: 1px solid var(--border);">const { TrustClient } = require('@aleph-icu/trust-sdk');
const client = new TrustClient({ apiKey: 'YOUR_KEY' });
const res = await client.verifySession('User', 'token');</pre>
    </section>
</div>"""
    }
}

# Template string with replacement tags
html_template = """<!doctype html>
<html lang="[LOC]" dir="ltr" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>[PAGE_TITLE] — Aleph Studio</title>
<meta name="theme-color" content="#080606">
<meta name="color-scheme" content="dark light">
<script>window.__ALEPH_LOCALE__ = '[LOC]';</script>
<script>(function(){try{var t=localStorage.getItem('aleph-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}}catch(e){}}());</script>
<link rel="icon" href="../../../favicon.ico" sizes="48x48">
<link rel="icon" href="../../../assets/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="../../../assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="../../../assets/icons/favicon-16.png" sizes="16x16" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&family=Unbounded:wght@200;400;700&display=swap">
<link rel="stylesheet" href="../../../assets/css/main.css?v=13">
<link rel="stylesheet" href="../../../assets/css/docs.css?v=4">
</head>
<body>
<a id="skipLink" class="skip-link" href="#main">[SKIP_LINK]</a>
<nav class="nav" aria-label="Main navigation">
    <a id="logoLink" class="nav-logo" href="../../../[LOC]/" aria-label="Aleph Studio">
        <span class="logo-sq" aria-hidden="true"></span>
        <span class="logo-text">Aleph Studio</span>
    </a>
    <div class="nav-links">
        <a id="navLinkProducts" class="nav__link" href="../../../[LOC]/products/">[NAV_PRODUCTS]</a>
        <a id="navLinkDonate" class="nav__link" href="../../../[LOC]/donate/" data-donate-link>[NAV_DONATE]</a>
    </div>
    <div class="nav-right">
        <button class="theme-btn" id="themeBtn" type="button" aria-label="Toggle theme" aria-pressed="false">
            <span class="theme-icon" id="themeIco" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.6M12 18.6v2.6M4.8 12H2.2M21.8 12h-2.6M5.9 5.9l1.9 1.9M16.2 16.2l1.9 1.9M18.1 5.9l-1.9 1.9M7.8 16.2l-1.9 1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
        </button>
        <div id="localeSwitcher" class="locale-switcher">
            <button id="localeSwitcherTrigger" class="locale-switcher__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Select language">
                <span id="localeSwitcherFlag" class="locale-switcher__flag" aria-hidden="true"></span>
                <span id="localeSwitcherLabel">[LOC_UPPER]</span>
                <svg class="locale-switcher__caret" viewBox="0 0 12 12" aria-hidden="true"><polyline points="2,4 6,8 10,4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div id="localeSwitcherMenu" class="locale-switcher__menu" role="menu" aria-label="Select language" hidden></div>
        </div>
    </div>
</nav>
<main id="main">
<div class="docs-page">
  <div class="docs-top">
    <a href="../" class="hero-store-back" aria-label="[BACK_ARIA]">
      <span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 12H6.75M6.75 12l5.1-5.1M6.75 12l5.1 5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="hero-store-back-label">[BACK_LABEL]</span>
    </a>
  </div>
<div class="docs-container">
    [SIDEBAR]
    [CONTENT]
</div>
</div>
</main>
<footer class="site-footer">
    <div class="site-footer__main">
        <div class="site-footer__left">
            <a class="site-footer__logo" href="../../../[LOC]/">
                <span class="site-footer__sq" aria-hidden="true"></span>
                <span class="site-footer__name">Aleph Studio</span>
            </a>
            <span class="site-footer__divider" aria-hidden="true"></span>
            <span id="footerTagline" class="site-footer__tagline">[TAGLINE]</span>
        </div>
        <nav id="footerNav" class="site-footer__nav" aria-label="Footer">
            <a href="../../../[LOC]/products/">[NAV_PRODUCTS]</a>
            <a href="../../../[LOC]/#manifesto">Принцип</a>
            <a href="../../../[LOC]/#team">Команда</a>
            <span class="site-footer__nav-sep" aria-hidden="true"></span>
            <a id="footerDonateLink" href="../../../[LOC]/donate/">[NAV_DONATE]</a>
        </nav>
        <div id="footerSocialLinks" class="site-footer__socials" aria-label="Social"></div>
    </div>
    <div class="site-footer__bottom">
        <span id="footerCopyright" class="site-footer__copy">[COPYRIGHT]</span>
    </div>
    <span id="footerDesc" hidden></span>
    <span id="footerNavHeading" hidden></span>
    <span id="footerWetteaHeading" hidden></span>
</footer>
<div id="toast" class="toast" role="status" aria-live="polite" aria-hidden="true"></div>
<script type="module" src="../../../src/docs/docs.js?v=2"></script>
</body>
</html>
"""

# Hub index page card links update
def update_hub_indexes():
    for loc in locales:
        filepath = os.path.join(ROOT, loc, "docs", "index.html")
        print(f"Updating hub index page clickable cards for: {filepath}")
        if not os.path.exists(filepath):
            print(f"  -> File {filepath} not found, skipping index update.")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace('\r', '')
        
        # Replace Card 1
        content = content.replace(
            '        <!-- Card 1: Agreements -->\n        <div class="docs-hub-card">',
            '        <!-- Card 1: Agreements -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'privacy/\'" style="cursor: pointer;">'
        )
        content = content.replace(
            '        <!-- Card 1: Agreements -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'privacy/\'" style="cursor: pointer;">',
            '        <!-- Card 1: Agreements -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'privacy/\'" style="cursor: pointer;">'
        )
        
        # Replace Card 2
        content = content.replace(
            '        <!-- Card 2: Troubleshooting -->\n        <div class="docs-hub-card">',
            '        <!-- Card 2: Troubleshooting -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'launcher/\'" style="cursor: pointer;">'
        )
        content = content.replace(
            '        <!-- Card 2: Troubleshooting -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'launcher/\'" style="cursor: pointer;">',
            '        <!-- Card 2: Troubleshooting -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'launcher/\'" style="cursor: pointer;">'
        )
        
        # Replace Card 3
        content = content.replace(
            '        <!-- Card 3: API & Integrations -->\n        <div class="docs-hub-card">',
            '        <!-- Card 3: API & Integrations -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'aleph-trust-api/\'" style="cursor: pointer;">'
        )
        content = content.replace(
            '        <!-- Card 3: API & Integrations -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'aleph-trust-api/\'" style="cursor: pointer;">',
            '        <!-- Card 3: API & Integrations -->\n        <div class="docs-hub-card" onclick="if(!event.target.closest(\'a\')) location.href=\'aleph-trust-api/\'" style="cursor: pointer;">'
        )
        
        content = content.replace('\n', '\r\n')
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print("  -> Index page updated.")

# Generate pages
def generate_all_pages():
    for loc in locales:
        meta = meta_data[loc]
        
        for cat in categories:
            filepath = os.path.join(ROOT, loc, "docs", cat, "index.html")
            
            # Determine group
            current_group = ""
            for grp, items in groups.items():
                if cat in items:
                    current_group = grp
                    break
            
            # Build sidebar
            if current_group == "agreements":
                sidebar_html = f"""    <div class="docs-nav">
        <div class="docs-nav-title">{meta["sidebar_title_rules"]}</div>
        <a class="docs-nav-link{{active_privacy}}" href="../privacy/">{meta["sidebar_links"]["privacy"]}</a>
        <a class="docs-nav-link{{active_terms}}" href="../terms/">{meta["sidebar_links"]["terms"]}</a>
        <a class="docs-nav-link{{active_user-agreement}}" href="../user-agreement/">{meta["sidebar_links"]["user-agreement"]}</a>
        <a class="docs-nav-link{{active_cookies}}" href="../cookies/">{meta["sidebar_links"]["cookies"]}</a>
    </div>"""
            elif current_group == "troubleshooting":
                sidebar_html = f"""    <div class="docs-nav">
        <div class="docs-nav-title">{meta["sidebar_title_issues"]}</div>
        <a class="docs-nav-link{{active_launcher}}" href="../launcher/">{meta["sidebar_links"]["launcher"]}</a>
        <a class="docs-nav-link{{active_integrity}}" href="../integrity/">{meta["sidebar_links"]["integrity"]}</a>
        <a class="docs-nav-link{{active_network}}" href="../network/">{meta["sidebar_links"]["network"]}</a>
        <a class="docs-nav-link{{active_faq}}" href="../faq/">{meta["sidebar_links"]["faq"]}</a>
    </div>"""
            else: # api
                sidebar_html = f"""    <div class="docs-nav">
        <div class="docs-nav-title">{meta["sidebar_title_api"]}</div>
        <a class="docs-nav-link{{active_aleph-trust-api}}" href="../aleph-trust-api/">{meta["sidebar_links"]["aleph-trust-api"]}</a>
        <a class="docs-nav-link{{active_wetid-auth}}" href="../wetid-auth/">{meta["sidebar_links"]["wetid-auth"]}</a>
        <a class="docs-nav-link{{active_webhooks}}" href="../webhooks/">{meta["sidebar_links"]["webhooks"]}</a>
        <a class="docs-nav-link{{active_sdk}}" href="../sdk/">{meta["sidebar_links"]["sdk"]}</a>
    </div>"""
            
            # Extract content if existing, or use placeholders
            content_html = ""
            if cat in ["privacy", "terms", "user-agreement", "cookies"] and os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    orig = f.read()
                match = re.search(r'(<div class="docs-content">[\s\S]*?</div>)', orig)
                if match:
                    content_html = match.group(1)
                    content_html = re.sub(r'<div class="docs-top">[\s\S]*?</div>', '', content_html)
                    
            if not content_html:
                content_html = new_pages_content[loc].get(cat, "<div class='docs-content'><h1>Placeholder</h1></div>")
                
            # Setup active classes
            active_dict = {}
            for c in categories:
                active_dict[f"active_{c}"] = " is-active" if c == cat else ""
                
            local_sidebar = sidebar_html.format(**active_dict)
            
            # Replace tags in page template
            page_text = html_template
            page_text = page_text.replace("[LOC]", loc)
            page_text = page_text.replace("[LOC_UPPER]", loc.upper())
            page_text = page_text.replace("[PAGE_TITLE]", meta["sidebar_links"][cat])
            page_text = page_text.replace("[SKIP_LINK]", meta["skip_link"])
            page_text = page_text.replace("[NAV_PRODUCTS]", meta["nav_products"])
            page_text = page_text.replace("[NAV_DONATE]", meta["nav_donate"])
            page_text = page_text.replace("[BACK_ARIA]", meta["back_aria"])
            page_text = page_text.replace("[BACK_LABEL]", meta["back_label"])
            page_text = page_text.replace("[TAGLINE]", meta["tagline"])
            page_text = page_text.replace("[COPYRIGHT]", meta["copyright"])
            page_text = page_text.replace("[SIDEBAR]", local_sidebar)
            page_text = page_text.replace("[CONTENT]", content_html)
            
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(page_text.replace('\n', '\r\n'))
            print(f"  -> Generated page: {filepath}")

# Run
update_hub_indexes()
generate_all_pages()
print("All done!")
