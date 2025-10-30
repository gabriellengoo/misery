export default {
    name: 'siteHeader',
    title: 'Site Header',
    type: 'document',
    fields: [
      {
        name: 'menuLabel',
        title: 'Menu Button Label',
        type: 'string',
        initialValue: 'menu',
      },
      {
        name: 'accessibilityLabel',
        title: 'Accessibility Button Label',
        type: 'string',
        initialValue: 'Aa',
      },
      // {
      //   name: 'eventsLabel',
      //   title: 'Events Button Label',
      //   type: 'string',
      //   initialValue: 'events',
      // },
      {
        name: 'helpLabel',
        title: 'Help Button Label',
        type: 'string',
        initialValue: 'help',
      },
      {
        name: 'helpLink',
        title: 'Help Page Link',
        type: 'url',
        initialValue: '/help',
      },
      {
        name: 'menuLinks',
        title: 'Sidebar Menu Links',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'label', type: 'string', title: 'Label' },
              { name: 'url', type: 'string', title: 'URL' },
            ],
          },
        ],
        initialValue: [
          { label: 'home', url: '/' },
          { label: 'events', url: '/events' },
          { label: 'about us', url: '/aa' },
          { label: 'contact', url: '/contact' },
        ],
      },
    ],
  }
  