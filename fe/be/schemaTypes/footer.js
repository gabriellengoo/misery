// footer.js (Navigation Links part)
export default {
  name: 'footer',
  type: 'document',
  title: 'Footer',
  fields: [
    { name: 'title', title: 'Page Title', type: 'string', initialValue: 'Footer' },
    {
      name: 'navLinks',
      type: 'array',
      title: 'Navigation Links',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            {
              name: 'link',
              type: 'reference',
              to: [
                { type: 'getInvolvedPage' },
                { type: 'pressPage' },
                { type: 'homepage' },
                { type: 'event' },
                { type: 'aboutPage' },
                // { type: 'contactPage' },

                // add other page types here
              ],
              title: 'Link to Page'
            }
          ]
        }
      ]
    },
      {
        name: 'donateLink',
        type: 'url',
        title: 'Donate Button URL'
      },
      {
        name: 'newsletter',
        type: 'object',
        title: 'Newsletter Section',
        fields: [
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'description', type: 'text', title: 'Description' },
          { name: 'placeholder', type: 'string', title: 'Email Placeholder' },
          { name: 'buttonText', type: 'string', title: 'Button Text' }
        ]
      }
    ]
  };
  