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
      name: 'docUrl',
      title: 'Doc URL',
      type: 'url',
      description: 'Optional Google Doc link that goes with this recipe',
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
