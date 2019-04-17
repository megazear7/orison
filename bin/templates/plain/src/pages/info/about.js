import { html, OrisonDirectory } from 'orison';

export default async () => {
  const file = new OrisonDirectory({ path: __dirname });
  const data = await file.getData();
  const parent = file.getParent();
  const parentData = await parent.getData();
  const childPaths = parent.getChildren().map(orisonDir => orisonDir.path).join(', ');

  return html`
    <p>About page</p>
    <p>${parentData.title}</p>
    <p>${childPaths}</p>
    <a href="${data.link.url}">${data.link.title}</a>
  `;
};
