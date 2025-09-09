export function buildTopicCode(book, chapter, topic) {
  if (topic?.value) return topic.value;
  if (chapter?.value) return chapter.value;
  if (book?.value) return book.value;
  return "";
}
