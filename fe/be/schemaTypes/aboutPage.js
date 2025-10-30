export default {
    name: 'aboutPage',
    title: 'About Page',
    type: 'document',
    fields: [
      {
        name: 'sections',
        title: 'Sections',
        type: 'array',
        of: [
          {
            type: 'reference',
            to: [{ type: 'aboutSection' }],
          },
        ],
      },
    ],
    preview: {
      select: {
        title: 'sections.0->title',
      },
      prepare(selection) {
        return { title: selection.title || 'About Page' }
      },
    },
  }
  