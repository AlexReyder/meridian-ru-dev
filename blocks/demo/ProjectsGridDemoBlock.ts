import type { Block } from 'payload'

export const ProjectsGridDemoBlock: Block = {
  slug: 'projectsGridDemo',
  labels: {
    singular: 'Projects Grid Demo',
    plural: 'Projects Grid Demo blocks',
  },
  fields: [
    {
      name: 'filters',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          admin: {
            description:
              'Технический id фильтра. Например: all, b2b, cms, websites',
          },
        },
        {
          name: 'label',
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
          type: 'text',
          required: true,
          defaultValue: 'проект',
          admin: {
            width: '33%',
          },
        },
        {
          name: 'resultsLabelFew',
          type: 'text',
          required: true,
          defaultValue: 'проекта',
          admin: {
            width: '33%',
          },
        },
        {
          name: 'resultsLabelMany',
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
          type: 'text',
          required: true,
          defaultValue: 'Что можно посмотреть',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'openDemoLabel',
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
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'textarea',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'demoUrl',
          type: 'text',
          required: true,
        },
        {
          name: 'filterIds',
          type: 'array',
          required: true,
          minRows: 1,
          admin: {
            description:
              'Список id фильтров, в которых должен показываться проект. Используйте значения из filters.id',
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'whatToShow',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'label',
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
          label: 'Выберите файл',
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