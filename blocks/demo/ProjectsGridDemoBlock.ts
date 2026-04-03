import type { Block } from 'payload'

export const ProjectsGridDemoBlock: Block = {
  slug: 'projectsGridDemo',
  labels: {
    singular: 'Сетка проектов demo',
    plural: 'Сетки проектов demo',
  },
  fields: [
    {
      name: 'filters',
      label: 'Фильтры',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'id',
          label: 'Технический ID фильтра',
          type: 'text',
          required: true,
          admin: {
            description:
              'Например: all, b2b, cms, websites. Используется в логике фильтрации.',
          },
        },
        {
          name: 'label',
          label: 'Название фильтра',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'resultsLabelOne',
          label: 'Подпись для 1 результата',
          type: 'text',
          required: true,
          defaultValue: 'проект',
          admin: {
            width: '33%',
          },
        },
        {
          name: 'resultsLabelFew',
          label: 'Подпись для 2-4 результатов',
          type: 'text',
          required: true,
          defaultValue: 'проекта',
          admin: {
            width: '33%',
          },
        },
        {
          name: 'resultsLabelMany',
          label: 'Подпись для 5+ результатов',
          type: 'text',
          required: true,
          defaultValue: 'проектов',
          admin: {
            width: '34%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'whatToShowLabel',
          label: 'Заголовок блока с пунктами',
          type: 'text',
          required: true,
          defaultValue: 'Что можно посмотреть',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'openDemoLabel',
          label: 'Текст кнопки открытия демо',
          type: 'text',
          required: true,
          defaultValue: 'Открыть демо',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'projects',
      label: 'Проекты',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'id',
          label: 'Технический ID проекта',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          label: 'Название проекта',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          label: 'Категория',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          label: 'Короткое описание',
          type: 'textarea',
          required: true,
        },
        {
          name: 'description',
          label: 'Полное описание',
          type: 'textarea',
          required: true,
        },
        {
          name: 'label',
          label: 'Плашка на карточке',
          type: 'text',
        },
        {
          name: 'demoUrl',
          label: 'Ссылка на демо',
          type: 'text',
          required: true,
        },
        {
          name: 'filterIds',
          label: 'ID фильтров',
          type: 'array',
          required: true,
          minRows: 1,
          admin: {
            description:
              'Укажи ID фильтров, в которых должен показываться проект. Значения должны совпадать с filters.id',
          },
          fields: [
            {
              name: 'value',
              label: 'ID фильтра',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'tags',
          label: 'Теги',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'label',
              label: 'Текст тега',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'whatToShow',
          label: 'Что можно посмотреть',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'label',
              label: 'Пункт списка',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'imageSource',
              label: 'Источник изображения',
              type: 'radio',
              defaultValue: 'url',
              options: [
                { label: 'URL', value: 'url' },
                { label: 'Загрузить файл', value: 'upload' },
              ],
              admin: {
                width: '50%',
              },
            },
            {
              name: 'alt',
              label: 'Alt изображения',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'imageUrl',
          label: 'URL изображения',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.imageSource === 'url',
          },
        },
        {
          name: 'imageMedia',
          label: 'Загруженное изображение',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.imageSource === 'upload',
          },
        },
      ],
    },
  ],
}