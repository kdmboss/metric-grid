/** Only explicitly approved, attributed quotes can enter the browser bundle. */
export function approvedContent(quotes, story) {
  return {
    quotes: Array.isArray(quotes) ? quotes.filter(q => q && q.permission === true && ['name', 'role', 'quote'].every(k => typeof q[k] === 'string' && q[k].trim())).map(q => ({ name: q.name.trim(), role: q.role.trim(), quote: q.quote.trim() })) : [],
    // Render as text paragraphs, never as HTML or executable Markdown.
    story: typeof story === 'string' ? story.trim() : '',
  };
}
