import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  MoreVertical,
  Hash,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

// --- Constants ---
const STORAGE_KEY = 'mymemo.notes';

const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "브랜딩 가이드라인에 따른 컬러 팔레트와 타이포그래피 규칙을 정리합니다. 특히 접근성을 고려한 대비비를 확인하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴의 아름다움\n4. 타이포그래피의 탄생",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "로컬 퍼스트 기반의 가벼운 메모장 서비스를 기획 중입니다. 오프라인에서도 작동하고 태그 기반으로 빠르게 검색할 수 있는 기능을 포함합니다.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString()
  }
];

// --- Utilities ---
const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

const setLocalStorage = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>(() => getLocalStorage(STORAGE_KEY, SEED_DATA));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');

  // --- Effects ---
  useEffect(() => {
    setLocalStorage(STORAGE_KEY, notes);
  }, [notes]);

  // --- Computed ---
  const allTags = useMemo(() => {
    const tagsMap = new Map<string, number>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        note.title.toLowerCase().includes(searchLower) ||
        note.body.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      return matchesTag && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchTerm]);

  // --- Handlers ---
  const handleAddNote = () => {
    if (!formTitle.trim() && !formBody.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formTitle.trim() || '제목 없는 메모',
      body: formBody.trim(),
      tags: formTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      updatedAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    closeModal();
  };

  const handleDeleteNote = (id: number) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const openModal = () => {
    setFormTitle('');
    setFormBody('');
    setFormTags('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#1A1A1A] font-sans selection:bg-[#E2E2E2]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <StickyNote size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">MyMemo</h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1A1]" size={18} />
            <input 
              type="text" 
              placeholder="제목, 내용, 태그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F3] border-none rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-[#1A1A1A]/10 transition-all outline-none text-sm"
              id="search-input"
            />
          </div>

          <button 
            onClick={openModal}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl hover:bg-[#333333] transition-all font-medium text-sm"
            id="new-note-btn"
          >
            <Plus size={18} />
            <span>새 메모</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 space-y-8 sticky top-28 self-start hidden md:block">
          <div>
            <h2 className="text-xs font-bold text-[#A1A1A1] uppercase tracking-widest mb-4">Categories</h2>
            <button 
              onClick={() => setSelectedTag(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${!selectedTag ? 'bg-white shadow-sm font-semibold' : 'hover:bg-[#EBEBEB]'}`}
            >
              <div className="flex items-center gap-2">
                <Hash size={16} className={!selectedTag ? 'text-[#1A1A1A]' : 'text-[#A1A1A1]'} />
                <span className="text-sm">전체</span>
              </div>
              <span className="text-[10px] bg-[#EBEBEB] px-1.5 py-0.5 rounded-md font-mono">{notes.length}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#A1A1A1] uppercase tracking-widest mb-4">Popular Tags</h2>
            <div className="space-y-1">
              {allTags.map(([tag, count]) => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${selectedTag === tag ? 'bg-white shadow-sm font-semibold' : 'hover:bg-[#EBEBEB]'}`}
                >
                  <div className="flex items-center gap-2">
                    <TagIcon size={16} className={selectedTag === tag ? 'text-[#1A1A1A]' : 'text-[#A1A1A1] group-hover:text-[#1A1A1A]'} />
                    <span className="text-sm">{tag}</span>
                  </div>
                  <span className="text-[10px] bg-[#EBEBEB] px-1.5 py-0.5 rounded-md font-mono">{count}</span>
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-xs text-[#A1A1A1] px-3">사용 중인 태그가 없습니다.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">
              {selectedTag ? `#${selectedTag}` : '모든 메모'}
              {searchTerm && <span className="ml-2 font-normal text-[#A1A1A1]">"{searchTerm}" 검색 결과</span>}
            </h2>
            <p className="text-sm text-[#A1A1A1]">총 {filteredNotes.length}개</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.article
                  layout
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all flex flex-col h-full"
                >
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-[#A1A1A1] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-[1]"
                    title="메모 삭제"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A1A1A] mb-3 pr-8 leading-tight line-clamp-2">{note.title}</h3>
                    <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap line-clamp-6 mb-4">{note.body}</p>
                  </div>

                  <div className="pt-4 border-t border-[#F5F5F3] flex flex-wrap gap-2 items-center justify-between mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 bg-[#F5F5F3] text-[#717171] text-[10px] font-bold rounded-md uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <time className="text-[10px] text-[#A1A1A1] font-mono">
                      {new Date(note.updatedAt).toLocaleDateString('ko-KR')}
                    </time>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {filteredNotes.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#A1A1A1]">
                <StickyNote size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p>메모를 찾을 수 없습니다.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              id="new-note-modal"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#F5F5F3]">
                <h2 className="text-xl font-bold">새 메모 작성</h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-[#F5F5F3] rounded-full transition-all text-[#A1A1A1] hover:text-[#1A1A1A]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest px-1">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="제목을 입력하세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-lg font-bold placeholder:text-[#D1D1D1] border-none outline-none focus:ring-0 px-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest px-1">Note Content</label>
                  <textarea 
                    placeholder="생각을 기록하세요..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    rows={8}
                    className="w-full text-sm leading-relaxed placeholder:text-[#D1D1D1] border-none outline-none focus:ring-0 resize-none px-0"
                  />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[#F5F5F3]">
                  <label className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest px-1 flex items-center gap-1.5">
                    <TagIcon size={10} /> Tags
                  </label>
                  <input 
                    type="text" 
                    placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 디자인, 개발)"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full text-xs font-medium placeholder:text-[#D1D1D1] border-none outline-none focus:ring-0 px-0"
                  />
                </div>
              </div>

              <div className="px-8 py-6 bg-[#F9F9F8] flex items-center justify-end gap-3">
                <button 
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-bold text-[#717171] hover:text-[#1A1A1A] transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddNote}
                  className="bg-[#1A1A1A] text-white px-8 py-2.5 rounded-xl hover:bg-[#333333] transition-all font-bold text-sm shadow-lg shadow-black/10"
                >
                  메모 저장
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
