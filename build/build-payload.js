module.exports = class BuildPayload {
  constructor(payload, language = 'en-US') {
    this.payload = payload;
    this.language = language;
  }

  get isBlogPost() {
    return
    this.payload &&
    this.payload.sys &&
    this.payload.sys.contentType &&
    this.payload.sys.contentType.sys &&
    this.payload.sys.contentType.sys.id === 'blogPost';
  }

  get hasSlug() {
    return
    this.payload &&
    this.payload.fields &&
    this.payload.fields.slug[language];
  }

  get slug() {
    return this.hasSlug ? this.payload.fields.slug[language] : undefined;
  }
}
