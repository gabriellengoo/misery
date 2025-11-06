export default {
  name: 'event',
  title: 'All Events (Event Page)',
  type: 'document',
  fields: [  
    // { name: 'title', title: 'Page Title', type: 'string', initialValue: 'Event' },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Event Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'body',
      title: 'Event Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'eventType',
      title: 'Event Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags', // allows adding custom tags in the editor
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'carouselImages',
      title: 'Past Event Carousel Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Optional images to show in a carousel if the event is past.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'location',
      media: 'image',
    },
  },
};
