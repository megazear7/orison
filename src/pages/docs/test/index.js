import { html } from '@popeindustries/lit-html-server';

export default context => {
  return html`
    <section>
      <h5>context.path</h5>
      ${context.path}
    </section>
    <section>
      <h5>context.data</h5>
      ${context.data.title}
    </section>
    <section>
      <h5>context.parents</h5>
      ${context.parents.map(parent => html`
        ${parent.data.title} >
      `)}
    </section>
    <section>
      <h5>context.children</h5>
      ${context.children.map(child => html`
        ${child.data.title},
      `)}
    </section>
    <section>
      <h5>context.parent</h5>
      ${context.parent.data.title}
    </section>
    <section>
      <h5>context.root</h5>
      ${context.root.data.title}
    </section>
    <section>
      <h5>context.local</h5>
      ${context.local.path}
      <br>
      ${context.data.title}
      <br>
      ${context.local.parents.map(parent => html`
        ${parent.data.title} >
      `)}
      <br>
      ${context.local.children.map(child => html`
        ${child.data.title},
      `)}
      <br>
      ${context.parent.data.title}
      <br>
      ${context.root.data.title}
    </section>
  `;
};
