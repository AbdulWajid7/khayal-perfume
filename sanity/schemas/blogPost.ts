export default {
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: { required: () => { (): unknown; new (): unknown } }) =>
        Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule: { required: () => { (): unknown; new (): unknown } }) =>
        Rule.required(),
    },
    { name: "metaTitle", title: "SEO Title", type: "string" },
    {
      name: "metaDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (Rule: { required: () => { (): unknown; new (): unknown } }) =>
        Rule.required(),
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 2,
      validation: (Rule: { max: (n: number) => { (): unknown; new (): unknown } }) =>
        Rule.max(200),
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
    {
      name: "readTime",
      title: "Read Time (minutes)",
      type: "number",
    },
  ],
};
