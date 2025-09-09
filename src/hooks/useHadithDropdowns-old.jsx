import { useState, useEffect, useCallback } from "react";
import axios from "../Utils/axios";

export default function useHadithDropdownsOld(i18n) {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [lastSelectedCode, setLastSelectedCode] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.protected.get("title-of-the-books", {
        headers: { "Accept-Language": i18n.language || "ar" },
      });
      setBooks(res.data || []);
    } catch {
      setBooks([]);
    }
  }, [i18n.language]);

  const fetchChapters = useCallback(
    async (bookCode) => {
      if (!bookCode) {
        setChapters([]);
        setSelectedChapter(null);
        return;
      }
      try {
        const res = await axios.protected.get(
          `title-of-the-chapters/by-book/${bookCode}`,
          { headers: { "Accept-Language": i18n.language || "ar" } }
        );
        setChapters(res.data || []);
        setSelectedChapter(null);
        setTopics([]);
        setSelectedTopic(null);
      } catch {
        setChapters([]);
      }
    },
    [i18n.language]
  );

  const fetchTopics = useCallback(
    async (chapterCode) => {
      if (!chapterCode) {
        setTopics([]);
        setSelectedTopic(null);
        return;
      }
      try {
        const res = await axios.protected.get(
          `the-subsidiary-topics/by-chapter/${chapterCode}`,
          { headers: { "Accept-Language": i18n.language || "ar" } }
        );
        setTopics(res.data || []);
        setSelectedTopic(null);
      } catch {
        setTopics([]);
      }
    },
    [i18n.language]
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook.value);
      setLastSelectedCode(selectedBook.value);
    }
  }, [selectedBook, fetchChapters]);

  useEffect(() => {
    if (selectedChapter) {
      fetchTopics(selectedChapter.value);
      setLastSelectedCode(selectedChapter.value);
    }
  }, [selectedChapter, fetchTopics]);

  useEffect(() => {
    if (selectedTopic) setLastSelectedCode(selectedTopic.value);
  }, [selectedTopic]);

  return {
    books,
    chapters,
    topics,
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    selectedTopic,
    setSelectedTopic,
    lastSelectedCode,
  };
}
