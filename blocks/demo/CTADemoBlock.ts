import type { Block } from 'payload'

import { PAGE_KEY_OPTIONS } from '../../lib/routes'

export const CTADemoBlock: Block = {
  slug: 'ctaDemo',
  labels: {
    singular: 'CTA Demo',
    plural: 'CTA Demo blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      required: true,
      defaultValue: 'Нужен проект такого уровня?',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Atelier Meridian помогает собирать сайты, B2B-системы, CMS, клиентские кабинеты, dashboards и mobile-first интерфейсы — от идеи до кликабельного результата, который можно согласовать и передать в разработку.',
    },

    {
      name: 'primaryButtonLabel',
      type: 'text',
      required: true,
      defaultValue: 'Обсудить проект',
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

    {
      name: 'supportText',
      type: 'textarea',
      required: true,
      defaultValue:
        'Если у вас уже есть задача, brief или направление проекта — мы предложим формат работы, сроки и стоимость без обязательного стартового звонка.',
    },
  ],
}