export default {
    name: 'homepage',
    title: 'Homepage',
    type: 'document',
    fields: [
      {
        name: 'carousel',
        title: 'Carousel Images',
        type: 'array',
        of: [
          {
            type: 'image',
            options: { hotspot: true },
          },
        ],
      },
      {
        name: 'featuredEvents',
        title: 'Featured Events (for homepage section)',
        type: 'array',
        of: [
          {
            type: 'reference',
            to: [{ type: 'event' }],
          },
        ],
      },
    ],
  }
  


