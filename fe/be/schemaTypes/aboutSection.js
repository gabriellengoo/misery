export default {
    name: 'aboutSection',
    title: 'About Section',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: Rule => Rule.required(),
      },
      {
        name: 'overlaySlug',
        title: 'Overlay Slug',
        type: 'slug',
        options: { source: doc => doc.title, maxLength: 50 },
        validation: Rule => Rule.required(),
      },
      {
        name: 'sectionType',
        title: 'Section Type',
        type: 'string',
        options: {
          list: ['story', 'faq', 'team', 'collaborators', 'mood', 'accordion'],
          layout: 'dropdown',
        },
        validation: Rule => Rule.required(),
      },
      {
        name: 'accordions',
        title: 'Accordion Items (for accordion sections)',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'accordionTitle', title: 'Accordion Title', type: 'string', validation: Rule => Rule.required() },
              { name: 'accordionContent', title: 'Accordion Content', type: 'array', of: [{ type: 'block' }] },
            ],
          },
        ],
        hidden: ({ parent }) => parent.sectionType !== 'accordion',
      },
      {
        name: 'content',
        title: 'Content (for non-accordion sections)',
        type: 'array',
        of: [{ type: 'block' }],
        hidden: ({ parent }) => parent.sectionType === 'accordion' || parent.sectionType === 'team' || parent.sectionType === 'collaborators',
      },
      {
        name: 'images',
        title: 'Images (optional carousel)',
        type: 'array',
        of: [{ type: 'image', options: { hotspot: true } }],
        hidden: ({ parent }) => parent.sectionType === 'team' || parent.sectionType === 'collaborators',
      },
      {
        name: 'urls',
        title: 'URLs (optional)',
        type: 'array',
        of: [{ type: 'url' }],
        description: 'Add any related links for this section',
      },
      {
        name: 'shortDescription',
        title: 'Short Description',
        type: 'text',
        rows: 2
      },
      {
        name: 'thumbnail',
        title: 'Thumbnail',
        type: 'image',
      },      
      {
        name: 'people',
        title: 'Team / Collaborators',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() },
              { name: 'role', title: 'Role / Description', type: 'text' },
              { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            ],
          },
        ],
        hidden: ({ parent }) => parent.sectionType !== 'team' && parent.sectionType !== 'collaborators',
      },
    ],
    preview: {
      select: {
        title: 'title',
        subtitle: 'sectionType',
        media: 'images.0',
      },
    },
  };
  