import type { Block } from 'payload'

import { PAGE_KEY_OPTIONS } from '../../lib/routes'

export const HeroProposalBlock: Block = {
  slug: 'heroProposal',
  labels: {
    singular: 'Главный экран страницы get proposal',
    plural: 'Главные экраны страницы get proposal',
  },
  fields: [
    {
      name: 'eyebrow',
      label: 'Надзаголовок',
      type: 'text',
      required: true,
      defaultValue: 'Получить предложение',
    },
    {
      name: 'title',
      label: 'Заголовок',
      type: 'textarea',
      required: true,
      defaultValue: 'Закажите дизайн сайта, системы или мобильного приложения',
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      required: true,
      defaultValue:
        'Расскажите, что вы планируете — сайт, корпоративный портал, B2B-систему, dashboard или mobile app. Мы предложим формат работы, сроки и стоимость без обязательного стартового звонка.',
    },
    {
      name: 'supportLine',
      label: 'Дополнительная строка',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'reassuranceItems',
      label: 'Пункты доверия',
      type: 'array',
      required: true,
      minRows: 1,
      defaultValue: [
        { icon: 'clock', text: 'Brief на 7 минут' },
        { icon: 'fileText', text: 'Без обязательного звонка' },
        { icon: 'shield', text: 'NDA-friendly' },
        { icon: 'users', text: 'Сайты, системы, приложения' },
      ],
      fields: [
        {
          name: 'icon',
          label: 'Иконка',
          type: 'select',
          dbName: 'hppr_icon',
          required: true,
          options: [
            { label: 'Clock', value: 'clock' },
            { label: 'FileText', value: 'fileText' },
            { label: 'Shield', value: 'shield' },
            { label: 'Users', value: 'users' },
          ],
          defaultValue: 'clock',
        },
        {
          name: 'text',
          label: 'Текст',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'cabinetButtonLabel',
      label: 'Текст кнопки личного кабинета',
      type: 'text',
      required: true,
      defaultValue: 'Перейти в личный кабинет',
    },
    {
      name: 'cabinetLinkType',
      label: 'Тип ссылки кнопки личного кабинета',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Страница сайта', value: 'page' },
        { label: 'Произвольная ссылка', value: 'url' },
      ],
    },
    {
      name: 'cabinetPageKey',
      label: 'Страница кнопки личного кабинета',
      type: 'select',
      dbName: 'hppr_cab_pk',
      options: PAGE_KEY_OPTIONS,
      defaultValue: 'home',
      admin: {
        condition: (_, siblingData) => siblingData?.cabinetLinkType === 'page',
      },
    },
    {
      name: 'cabinetUrl',
      label: 'URL кнопки личного кабинета',
      type: 'text',
      admin: {
        description: 'Например: https://client.example.com',
        condition: (_, siblingData) => siblingData?.cabinetLinkType === 'url',
      },
    },

    {
      name: 'brandParagraph',
      label: 'Нижний абзац',
      type: 'textarea',
      required: true,
      defaultValue:
        'Atelier Meridian помогает founders, B2B-командам, агентствам и integrators превращать идеи, сложные процессы и product requirements в понятную структуру, prototype и материалы для передачи в разработку.',
    },
  ],
}