module.exports = class BuildPayload {
  constructor(payload, language = 'en-US') {
    this.payload = payload;
    try {
      this.jsonPayload = JSON.parse(payload);
    } catch {
      this.jsonPayload = {};
    }
    this.language = language;
  }

  get isBlogPost() {
    return this.jsonPayload &&
    this.jsonPayload.sys &&
    this.jsonPayload.sys.contentType &&
    this.jsonPayload.sys.contentType.sys &&
    this.jsonPayload.sys.contentType.sys.id === 'blogPost';
  }

  get hasSlug() {
    return this.jsonPayload &&
    this.jsonPayload.fields &&
    this.jsonPayload.fields.slug[this.language];
  }

  get slug() {
    return this.hasSlug ? this.jsonPayload.fields.slug[this.language] : undefined;
  }
}
