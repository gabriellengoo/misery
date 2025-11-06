export default {
    name: 'contactPage',
    title: 'Contact Page',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Page Title',
        type: 'string',
        validation: Rule => Rule.required()
      },
      {
        name: 'summary',
        title: 'Page Summary',
        type: 'blockContent'
      },
      {
        name: 'newsletter',
        title: 'Newsletter',
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'description', title: 'Description', type: 'blockContent' },
          { name: 'formspreeUrl', title: 'Formspree URL', type: 'url' }
        ]
      },
      {
        name: 'socialLinks',
        title: 'Socials',
        type: 'array',
        of: [{ type: 'object', fields: [
          { name: 'label', title: 'Label', type: 'string' },
          { name: 'url', title: 'URL', type: 'url' }
        ]}]
      },
      {
        name: 'email',
        title: 'Email Contact',
        type: 'string'
      },
      {
        name: 'anonFeedback',
        title: 'Anonymous Feedback Form URL',
        type: 'url'
      },
      {
        name: 'content',
        title: 'Main Content',
        type: 'array',
        of: [{ type: 'block' }]
      }
    ]
  };
  