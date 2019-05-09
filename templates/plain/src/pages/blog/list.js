import { html } from 'orison';

export default (context, slug) => {
  const blogs = [{
		name: 'blog-a',
		html: html `<section><p>Blog A</p></section>`,
	},
	{
		name: 'blog-b',
		html: html `<section><p>Blog B</p></section>`,
	},
	{
		name: 'blog-c',
		html: html `<section><p>Blog C</p></section>`,
	}];

  return slug ? blogs.find(blog => blog.name === slug).html : blogs;
};
