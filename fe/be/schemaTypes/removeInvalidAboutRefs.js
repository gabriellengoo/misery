import client from 'part:@sanity/base/client'

const pages = await client.fetch('*[_type=="aboutPage"]{_id, sections}')

for (const page of pages) {
  const validRefs = (page.sections || []).map(ref => ({ _ref: ref._ref, _key: ref._key }))
  await client.patch(page._id).set({ sections: validRefs }).commit()
  console.log('Cleaned page', page._id)
}
console.log('All aboutPage documents cleaned.')