import type { Block } from 'payload'

export const ExplanationDemoBlock: Block = {
  slug: 'explanationDemo',
  labels: {
    singular: 'Пояснение demo',
    plural: 'Пояснения demo',
  },
  fields: [
    {
      name: 'title',
      label: 'Заголовок',
      type: 'textarea',
      required: true,
      defaultValue: 'Почему это сильнее обычных кейсов',
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      required: true,
      defaultValue:
        'Вместо статичных обложек и красивых экранов мы показываем кликабельные прототипы реальных проектов. Это позволяет увидеть, как устроен продукт, какие сценарии в нём собраны и какой уровень глубины клиент получает на выходе.',
    },
    {
      name: 'points',
      label: 'Пункты',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'icon',
          label: 'Иконка',
          type: 'select',
          required: true,
          defaultValue: 'play',
          options: [
            { label: 'Play', value: 'play' },
            { label: 'Layers', value: 'layers' },
            { label: 'Target', value: 'target' },
          ],
        },
        {
          name: 'text',
          label: 'Текст пункта',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}