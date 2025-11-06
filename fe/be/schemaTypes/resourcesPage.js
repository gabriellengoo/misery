export default {
  name: 'resourcesPage',
  title: 'Resources Page',
  type: 'document',
  fields: [
    { name: 'title', title: 'Page Title', type: 'string' },
    { name: 'summary', title: 'Page Summary', type: 'blockContent' },

    {
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] },
            {
              name: 'links',
              title: 'Optional Links',
              type: 'array',
              of: [{ type: 'object', fields: [
                { name: 'text', title: 'Text', type: 'string' },
                { name: 'url', title: 'URL', type: 'url' }
              ]}]
            },
            {
              name: 'images',
              title: 'Optional Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }]
            }
          ]
        }
      ],
      initialValue: [
        { title: 'Phone/Text Support', content: [] },
        { title: 'In-Person London-Based Support', content: [] },
        { title: 'Communities & Collectives (UK)', content: [] },
        { title: 'Communities & Collectives (Global)', content: [] },
        { title: 'Housing (London/UK)', content: [] },
        { title: 'Grief', content: [] },
        { title: 'Sexual Health', content: [] },
        { title: 'Anti-Blackness', content: [] },
        { title: 'Fatphobia', content: [] },
        { title: 'Suicide', content: [] },
        { title: 'Substance Use/Harm Reduction', content: [] },
        { title: 'LGBTQIA+ & Trauma Herbalism', content: [] },
        { title: 'Therapy', content: [] },
        { title: 'Queer and Trans Friendly: Moving Your Body!', content: [] },
        { title: 'Transformative Justice', content: [] },
      ]
    }
  ]
};
