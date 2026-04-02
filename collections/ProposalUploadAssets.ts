import type { CollectionConfig } from 'payload'

export const ProposalUploadAssets: CollectionConfig = {
  slug: 'proposal-upload-assets',
  labels: {
    singular: 'Загруженный файл клиента',
    plural: 'Загруженные файлы клиентов',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ['filename', 'status', 'filesize', 'request', 'updatedAt'],
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
      required: true,
    },
    {
      name: 'mimeType',
      type: 'text',
      required: true,
    },
    {
      name: 'filesize',
      type: 'number',
      required: true,
    },
    {
      name: 'storageKey',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'downloadUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'uploadToken',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'Attached', value: 'attached' },
      ],
    },
    {
      name: 'request',
      type: 'relationship',
      relationTo: 'proposal-requests',
      required: false,
    },
  ],
}