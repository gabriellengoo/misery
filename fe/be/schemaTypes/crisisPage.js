export default {
    name: 'crisisPage',
    title: 'Crisis Page',
    type: 'document',
    fields: [
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }
    ]
  };
  