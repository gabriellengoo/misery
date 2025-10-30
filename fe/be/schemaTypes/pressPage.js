// schemas/pressPage.js
export default {
    name: 'pressPage',
    title: 'Press Page',
    type: 'document',
    fields: [
      {
        name: 'sections',
        title: 'Sections',
        type: 'array',
        of: [
          {
            type: 'object',
            title: 'Section',
            fields: [
              {
                name: 'title',
                title: 'Section Title',
                type: 'string',
                validation: Rule => Rule.required(),
              },
              {
                name: 'content',
                title: 'Content',
                type: 'array',
                of: [{ type: 'block' }],
              },
            ],
          },
        ],
        validation: Rule => Rule.required(),
      },
    ],
    preview: {
      select: {
        title: 'sections.0.title',
      },
      prepare(selection) {
        return {
          title: selection.title || 'Press Page',
        };
      },
    },
  };
  