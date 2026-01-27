export default {
  name: 'preorderPage',
  title: 'Preorder Page',
  type: 'document',
  fields: [
    {
      name: 'preorderLink',
      title: 'Preorder Link',
      type: 'url',
      description: 'Shopwired URL that the button should open',
      validation: (Rule) => Rule.required(),
    },
  ],
};
