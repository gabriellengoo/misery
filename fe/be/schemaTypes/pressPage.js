// schemas/pressPage.js
export default {
  name: 'pressPage',
  title: 'Press Page',
  type: 'document',
  fields: [
    { name: 'title', title: 'Page Title', type: 'string', initialValue: 'Press' },
    {
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
            {
              name: 'articles',
              title: 'Articles / Flyers',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'title', title: 'Title', type: 'string' },
                    { name: 'url', title: 'URL', type: 'url' },
                    { name: 'image', title: 'Flyer Image', type: 'image', options: { hotspot: true } },
                    { name: 'shortDescription', title: 'Short Description', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
