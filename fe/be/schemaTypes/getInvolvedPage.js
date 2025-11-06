import blockContent from './blockContent';

export default {
  name: 'getInvolvedPage',
  type: 'document',
  title: 'Get Involved Page',
  fields: [
    { name: 'title', type: 'string', title: 'Page Title' },
    { name: 'summary', type: 'text', title: 'Page Summary' },
    {
      name: 'sections',
      type: 'array',
      title: 'Sections',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Section Title' },
            { name: 'description', type: 'blockContent', title: 'Section Description' },
            {
              name: 'links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'text', type: 'string' },
                    { name: 'url', type: 'url' }
                  ]
                }
              ]
            },
            {
              name: 'images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }]
            }
          ]
        }
      ]
    }
  ]
};
