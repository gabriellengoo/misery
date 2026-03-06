export default {
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  fields: [
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
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'chef',
      title: 'Chef',
      type: 'string',
      description: 'Person who contributed the recipe',
    },
    {
      name: 'spoonLevel',
      title: 'Spoon level',
      type: 'number',
      description: '0 = easiest / most restorative, 5 = the most energy to make',
      validation: (Rule) => Rule.required().min(0).max(5).integer(),
    },
    {
      name: 'websiteListed',
      title: 'Website listed',
      type: 'boolean',
      initialValue: false,
      description: 'Set by sync when this recipe is included on the for website sheet',
    },
    {
      name: 'vegan',
      title: 'Vegan',
      type: 'boolean',
      description: 'Toggle if the recipe is vegan-friendly',
      initialValue: false,
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      description: 'Optional supporting artwork',
    },
    {
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      description: 'Primary image uploaded from Sheet1 imageUrl when available',
    },
    {
      name: 'extras',
      title: 'Extras',
      type: 'text',
      rows: 3,
      description: 'Optional notes, credit, or micro context',
    },
    {
      name: 'content',
      title: 'Recipe details',
      type: 'text',
      rows: 8,
      description: 'Paste the full recipe/notes that you want to appear on the recipe page',
    },
    {
      name: 'contentText',
      title: 'Doc content (text)',
      type: 'text',
      rows: 10,
      description: 'Imported plain text from the Google Doc',
    },
    {
      name: 'docUrl',
      title: 'Doc URL',
      type: 'url',
      description: 'Optional Google Doc link that goes with this recipe',
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'url',
      description: 'Optional Google Drive/public image URL used as a fallback when no uploaded image exists',
    },
    {
      name: 'pageStart',
      title: 'PDF page start',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    },
    {
      name: 'pageEnd',
      title: 'PDF page end',
      type: 'number',
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .custom((value, context) => {
            const start = context?.parent?.pageStart
            if (!Number.isFinite(value) || !Number.isFinite(start)) return true
            return value >= start || 'pageEnd must be greater than or equal to pageStart'
          }),
    },
    {
      name: 'pdfPath',
      title: 'PDF path',
      type: 'string',
      initialValue: '/cookbook.pdf',
      validation: (Rule) => Rule.required(),
      description: 'Public path to the source PDF',
    },
    {
      name: 'hotspots',
      title: 'Hotspots',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'pageNumber',
              title: 'Page number',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(1),
            },
            {
              name: 'x',
              title: 'X (%)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'y',
              title: 'Y (%)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'w',
              title: 'Width (%)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'h',
              title: 'Height (%)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'type',
              title: 'Hotspot type',
              type: 'string',
              options: {
                list: [
                  { title: 'Audio', value: 'audio' },
                  { title: 'Text', value: 'text' },
                  { title: 'Spoon', value: 'spoon' },
                  { title: 'Video', value: 'video' },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
            },
            {
              name: 'audioUrl',
              title: 'Audio URL',
              type: 'url',
            },
            {
              name: 'videoUrl',
              title: 'Video URL',
              type: 'url',
            },
          ],
          preview: {
            select: {
              type: 'type',
              pageNumber: 'pageNumber',
            },
            prepare({ type, pageNumber }) {
              return {
                title: `${type || 'hotspot'} · page ${pageNumber || '?'}`,
              }
            },
          },
        },
      ],
      description: 'Optional click targets shown on top of rendered PDF pages',
    },
    {
      name: 'voiceNoteUrl',
      title: 'Voice note URL',
      type: 'url',
      description: 'Link to a voice note/audio file (for the manual paste flow)',
    },
    {
      name: 'voiceNote',
      title: 'Voice note file',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
    },
    {
      name: 'intro',
      title: 'Intro copy',
      type: 'text',
    },
    {
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
    },
    {
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
    },
    {
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    },
    {
      name: 'contentHtml',
      title: 'Doc content (HTML)',
      type: 'text',
    },
    {
      name: 'timeText',
      title: 'Time text',
      type: 'string',
    },
    {
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'title',
      chef: 'chef',
      spoonLevel: 'spoonLevel',
      vegan: 'vegan',
    },
    prepare({ title, chef, spoonLevel, vegan }) {
      const veganBadge = vegan ? ' · vegan' : '';
      return {
        title,
        subtitle: `${chef ? `${chef} · ` : ''}spoons ${spoonLevel ?? 'n/a'}${veganBadge}`,
      };
    },
  },
};
