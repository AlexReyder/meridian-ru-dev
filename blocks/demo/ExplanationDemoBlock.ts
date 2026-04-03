import type { Block } from 'payload'

export const ExplanationDemoBlock: Block = {
  slug: 'explanationDemo',
  labels: {
    singular: 'Explanation Demo',
    plural: 'Explanation Demo blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      required: true,
      defaultValue: 'Почему это сильнее обычных кейсов',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Вместо статичных обложек и красивых экранов мы показываем кликабельные прототипы реальных проектов. Это позволяет увидеть, как устроен продукт, какие сценарии в нём собраны и какой уровень глубины клиент получает на выходе.',
    },
    {
      name: 'points',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'icon',
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
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}