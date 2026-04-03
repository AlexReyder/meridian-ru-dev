import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

async function run() {
  const payload = await getPayload({ config })

  const pageData = {
    routeType: 'system' as const,
    pageKey: 'demo' as const,
    internalName: 'Demo',
    metaTitle: 'Реализованные проекты | Atelier Meridian',
    metaDescription:
      'Не просто экраны, а рабочие кликабельные прототипы сайтов, B2B-систем, CMS, клиентских кабинетов и mobile-first интерфейсов, которые можно открыть и пройти вживую.',
    layout: [
      {
        blockType: 'heroDemo',
        eyebrow: 'Портфолио студии',
        title: 'Реализованные проекты',
        description:
          'Не просто экраны, а рабочие кликабельные прототипы сайтов, B2B-систем, CMS, клиентских кабинетов и mobile-first интерфейсов, которые можно открыть и пройти вживую.',
        supportingText:
          'Обычно студии показывают кейсы и скриншоты. Мы показываем рабочие demo flow, чтобы вы могли увидеть не только визуал, но и саму логику продукта: роли, пользовательские сценарии, навигацию, основные модули и готовность к следующему этапу.',
        primaryButtonLabel: 'Обсудить похожий проект',
        primaryPageKey: 'get-proposal',
        secondaryButtonLabel: 'Перейти в личный кабинет',
        secondaryLinkType: 'url',
        secondaryUrl: '/get-proposal',
      },
      {
        blockType: 'projectsGridDemo',
        filters: [
          { id: 'all', label: 'Все' },
          { id: 'b2b', label: 'B2B systems' },
          { id: 'cms', label: 'CMS' },
          { id: 'websites', label: 'Websites' },
          { id: 'portals', label: 'Client portals' },
          { id: 'mobile', label: 'Mobile apps' },
          { id: 'internal', label: 'Internal tools' },
        ],
        resultsLabelOne: 'проект',
        resultsLabelFew: 'проекта',
        resultsLabelMany: 'проектов',
        whatToShowLabel: 'Что можно посмотреть',
        openDemoLabel: 'Открыть демо',
        projects: [
          {
            id: 'cortex-todo',
            title: 'Cortex ToDo',
            category: 'B2B system / SaaS interface / Workflow tool',
            subtitle:
              'Кликабельный прототип корпоративной системы для управления задачами, проектами и ежедневной командной работой.',
            description:
              'Этот проект показывает, как может выглядеть современный корпоративный инструмент для командной работы: с ролями, доступами, управленческими экранами и ежедневными сценариями пользователей.',
            tags: [
              { label: 'B2B system' },
              { label: 'SaaS interface' },
              { label: 'Workflow tool' },
            ],
            whatToShow: [
              { label: 'главный экран' },
              { label: 'список задач' },
              { label: 'карточка задачи' },
              { label: 'роли и права доступа' },
              { label: 'проекты и рабочие пространства' },
              { label: 'отчеты и настройки' },
            ],
            demoUrl: 'https://cortex.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/cortex-ai.png',
            alt: 'Cortex ToDo',
            label: 'Корпоративная система',
            filterIds: [{ value: 'b2b' }, { value: 'internal' }],
          },
          {
            id: 'sloist',
            title: 'Интерьерная B2B платформа',
            category: 'CMS / B2B system / Workflow tool',
            subtitle:
              'Рабочая система для дизайнеров, производителей и проектной комплектации с каталогом, проектами и логикой запросов.',
            description:
              'Это кликабельный прототип внутренней B2B-платформы, в которой соединены проектная работа дизайнера, каталог, карточки товаров, кастомные запросы и кабинет производителя.',
            tags: [
              { label: 'CMS' },
              { label: 'B2B system' },
              { label: 'Workflow tool' },
            ],
            whatToShow: [
              { label: 'проекты и карточки проектов' },
              { label: 'каталог и карточки товаров' },
              { label: 'добавление позиций' },
              { label: 'кабинет производителя' },
              { label: 'запросы и сравнение предложений' },
            ],
            demoUrl: 'https://sloist.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/sloist.png',
            alt: 'Интерьерная B2B платформа',
            label: 'Внутренняя B2B-система',
            filterIds: [{ value: 'b2b' }, { value: 'cms' }],
          },
          {
            id: 'cms-gallery',
            title: 'CMS для галерей',
            category: 'CMS / Internal tool / SaaS interface',
            subtitle:
              'Внутренняя система для управления галереей, каталогом работ, событиями, запросами и white-label сайтом.',
            description:
              'Этот проект показывает, как может выглядеть рабочая digital-система для галереи, в которой объединены контент, продажи, события, запросы, резервы и управление публичным сайтом.',
            tags: [
              { label: 'CMS' },
              { label: 'Internal tool' },
              { label: 'SaaS interface' },
              { label: 'B2B system' },
            ],
            whatToShow: [
              { label: 'Dashboard' },
              { label: 'Artworks и Artists' },
              { label: 'inquiries и reserves' },
              { label: 'Events Manager' },
              { label: 'Website builder' },
              { label: 'Orders / Deals' },
              { label: 'Team и Integrations' },
            ],
            demoUrl: 'https://cmsgallery.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/cms-gallery.png',
            alt: 'CMS для галерей',
            label: 'CMS для галерей',
            filterIds: [
              { value: 'cms' },
              { value: 'internal' },
              { value: 'b2b' },
            ],
          },
          {
            id: 'gallery',
            title: 'Сайт галереи',
            category: 'Website / White-label / Multilingual platform',
            subtitle:
              'Публичный white-label сайт для галереи с каталогом работ, выставками, событиями и страницами авторов.',
            description:
              'Это не просто красивый сайт, а premium digital-витрина с понятной структурой каталога, карточек работ, событий и пользовательского пути.',
            tags: [
              { label: 'Website' },
              { label: 'White-label' },
              { label: 'Art platform' },
              { label: 'Multilingual' },
            ],
            whatToShow: [
              { label: 'homepage' },
              { label: 'works catalog' },
              { label: 'artwork detail' },
              { label: 'exhibition pages' },
              { label: 'events list' },
              { label: 'artists section' },
              { label: 'contact and visit flows' },
            ],
            demoUrl: 'https://gallery.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/gallery.png',
            alt: 'Сайт галереи',
            label: 'White-label сайт',
            filterIds: [{ value: 'websites' }],
          },
          {
            id: 'se-platform',
            title: 'B2B система для работы с дизайнерами',
            category: 'B2B system / Mobile app / Workflow tool',
            subtitle:
              'Веб-платформа и мобильное приложение для подбора решений, согласования, обучения и аналитики в проектных продажах.',
            description:
              'Этот проект собран как единая рабочая среда для бренда, который взаимодействует с дизайнерами, архитекторами, продажами и маркетингом.',
            tags: [
              { label: 'B2B system' },
              { label: 'Mobile app' },
              { label: 'Workflow tool' },
            ],
            whatToShow: [
              { label: 'список проектов' },
              { label: 'карточка проекта' },
              { label: 'помещения и подбор решений' },
              { label: 'клиентское согласование' },
              { label: 'образцы и обучение' },
              { label: 'аналитика' },
              { label: 'мобильные сценарии' },
            ],
            demoUrl: 'https://se.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/se-platform.png',
            alt: 'B2B система для работы с дизайнерами',
            label: 'Внутренняя B2B-система',
            filterIds: [
              { value: 'b2b' },
              { value: 'mobile' },
              { value: 'portals' },
            ],
          },
          {
            id: 'cortex-todo-site',
            title: 'Сайт для IT-продукта',
            category: 'Website / B2B system / SaaS interface',
            subtitle:
              'Кликабельный прототип корпоративного сайта для технологической платформы с двумя продуктовыми направлениями.',
            description:
              'Проект показывает, как может выглядеть сильный B2B-сайт для технологической компании, которая продаёт не один продукт, а платформенную логику с несколькими сценариями входа.',
            tags: [
              { label: 'Website' },
              { label: 'B2B system' },
              { label: 'SaaS interface' },
            ],
            whatToShow: [
              { label: 'первый экран' },
              { label: 'логика двух продуктов' },
              { label: 'архитектура платформы' },
              { label: 'блоки доверия и безопасности' },
              { label: 'сценарии перехода' },
              { label: 'финальные CTA' },
            ],
            demoUrl: 'https://todo.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/cortex-todo.png',
            alt: 'Сайт для IT-продукта',
            label: 'Корпоративный сайт',
            filterIds: [{ value: 'websites' }, { value: 'b2b' }],
          },
          {
            id: 'curator',
            title: 'Маркетплейс для дизайнеров по картинам',
            category: 'Client portal / B2B system / Workflow tool',
            subtitle:
              'Закрытый кабинет для архитекторов и дизайнеров с подбором работ, проектами и клиентским proposal view.',
            description:
              'Этот проект показывает сложный профессиональный B2B-интерфейс, где каталог, проектная работа, клиентский просмотр, AI-помощник и операционные сценарии объединены в одной системе.',
            tags: [
              { label: 'Client portal' },
              { label: 'B2B system' },
              { label: 'Workflow tool' },
              { label: 'Art platform' },
            ],
            whatToShow: [
              { label: 'dashboard' },
              { label: 'каталог с фильтрами' },
              { label: 'project board' },
              { label: 'client view' },
              { label: 'AI Match' },
              { label: 'requests and reserves' },
            ],
            demoUrl: 'https://curator.arten-studio.ru',
            imageSource: 'url',
            imageUrl: '/images/demo/curator.png',
            alt: 'Маркетплейс для дизайнеров по картинам',
            label: 'B2B-портал',
            filterIds: [{ value: 'portals' }, { value: 'b2b' }],
          },
        ],
      },
      {
        blockType: 'explanationDemo',
        title: 'Почему это сильнее обычных кейсов',
        description:
          'Вместо статичных обложек и красивых экранов мы показываем кликабельные прототипы реальных проектов. Это позволяет увидеть, как устроен продукт, какие сценарии в нём собраны и какой уровень глубины клиент получает на выходе.',
        points: [
          {
            icon: 'play',
            text: 'Можно открыть и пройти сценарий',
          },
          {
            icon: 'layers',
            text: 'Видна не только картинка, но и логика системы',
          },
          {
            icon: 'target',
            text: 'Такой формат лучше показывает будущий результат до разработки',
          },
        ],
      },
      {
        blockType: 'ctaDemo',
        title: 'Нужен проект такого уровня?',
        description:
          'Atelier Meridian помогает собирать сайты, B2B-системы, CMS, клиентские кабинеты, dashboards и mobile-first интерфейсы — от идеи до кликабельного результата, который можно согласовать и передать в разработку.',
        primaryButtonLabel: 'Обсудить проект',
        primaryPageKey: 'get-proposal',
       secondaryButtonLabel: 'Перейти в личный кабинет',
        secondaryLinkType: 'url',
        secondaryUrl: '/get-proposal',
        supportText:
          'Если у вас уже есть задача, brief или направление проекта — мы предложим формат работы, сроки и стоимость без обязательного стартового звонка.',
      },
    ],
  }

  const existing = await payload.find({
    collection: 'pages',
    where: {
      pageKey: {
        equals: 'demo',
      },
    },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      locale: 'ru',
      depth: 0,
      data: pageData,
    })

    console.log('Demo page updated')
    return
  }

  await payload.create({
    collection: 'pages',
    locale: 'ru',
    depth: 0,
    data: pageData,
  })

  console.log('Demo page created')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })