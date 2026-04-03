import type { Block } from 'payload'

import { PAGE_KEY_OPTIONS } from '../../lib/routes'

export const HeroDemoBlock: Block = {
  slug: 'heroDemo',
  labels: {
    singular: 'Hero Demo',
    plural: 'Hero Demo blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      defaultValue: 'Портфолио студии',
    },
    {
      name: 'title',
      type: 'textarea',
      required: true,
      defaultValue: 'Реализованные проекты',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Не просто экраны, а рабочие кликабельные прототипы сайтов, B2B-систем, CMS, клиентских кабинетов и mobile-first интерфейсов, которые можно открыть и пройти вживую.',
    },
    {
      name: 'supportingText',
      type: 'textarea',
      required: true,
      defaultValue:
        'Обычно студии показывают кейсы и скриншоты. Мы показываем рабочие demo flow, чтобы вы могли увидеть не только визуал, но и саму логику продукта: роли, пользовательские сценарии, навигацию, основные модули и готовность к следующему этапу.',
    },

    {
      name: 'primaryButtonLabel',
      type: 'text',
      required: true,
      defaultValue: 'Обсудить похожий проект',
    },
    {
      name: 'primaryLinkType',
      label: 'Тип первой ссылки',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Страница сайта', value: 'page' },
        { label: 'Произвольная ссылка', value: 'url' },
      ],
    },
    {
      name: 'primaryPageKey',
      label: 'Первая страница',
      type: 'select',
      options: PAGE_KEY_OPTIONS,
      defaultValue: 'get-proposal',
      admin: {
        condition: (_, siblingData) => siblingData?.primaryLinkType === 'page',
      },
    },
    {
      name: 'primaryUrl',
      label: 'Первая ссылка URL',
      type: 'text',
      admin: {
        description: 'Например: /login или https://client.example.com',
        condition: (_, siblingData) => siblingData?.primaryLinkType === 'url',
      },
    },

    {
      name: 'secondaryButtonLabel',
      type: 'text',
      required: true,
      defaultValue: 'Перейти в личный кабинет',
    },
    {
      name: 'secondaryLinkType',
      label: 'Тип второй ссылки',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Страница сайта', value: 'page' },
        { label: 'Произвольная ссылка', value: 'url' },
      ],
    },
    {
      name: 'secondaryPageKey',
      label: 'Вторая страница',
      type: 'select',
      options: PAGE_KEY_OPTIONS,
      defaultValue: 'get-proposal',
      admin: {
        condition: (_, siblingData) => siblingData?.secondaryLinkType === 'page',
      },
    },
    {
      name: 'secondaryUrl',
      label: 'Вторая ссылка URL',
      type: 'text',
      admin: {
        description: 'Например: /login или https://client.example.com',
        condition: (_, siblingData) => siblingData?.secondaryLinkType === 'url',
      },
    },
  ],
}