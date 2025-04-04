import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import VectorStoreCreator from "@/components/vector-store-creator";
import ChatInterface from "@/components/chat-interface";
import KnowledgeGraphBuilder from "@/components/knowledge-graph-builder";
import UploadModal from "@/components/upload-modal";
import SuggestionMarquee from "@/components/suggestion-marquee";
import { Book } from "@shared/schema";
import { useBookContext } from "@/contexts/book-context";

export default function Dashboard() {
  const { books, isLoading } = useBooks();
  const { selectedBook, setSelectedBook } = useBookContext();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(400);
  const [rightPanelWidth, setRightPanelWidth] = useState(350);
  const [isLeftResizing, setIsLeftResizing] = useState(false);
  const [isRightResizing, setIsRightResizing] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Handle book selection
  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    const book = books?.find((b) => b.id === bookId);
    if (book) {
      setSelectedBook(book);
    }
  };

  // Handle panel resizing
  const handleLeftResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeftResizing(true);
    document.addEventListener("mousemove", handleLeftResize);
    document.addEventListener("mouseup", stopLeftResize);
  };

  const handleLeftResize = (e: MouseEvent) => {
    if (!isLeftResizing) return;
    const newWidth = e.clientX;
    
    // Set bounds
    if (newWidth < 400) {
      setLeftPanelWidth(400);
    } else if (newWidth > 600) {
      setLeftPanelWidth(600);
    } else {
      setLeftPanelWidth(newWidth);
    }
  };

  const stopLeftResize = () => {
    setIsLeftResizing(false);
    document.removeEventListener("mousemove", handleLeftResize);
    document.removeEventListener("mouseup", stopLeftResize);
  };

  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRightResizing(true);
    document.addEventListener("mousemove", handleRightResize);
    document.addEventListener("mouseup", stopRightResize);
  };

  const handleRightResize = (e: MouseEvent) => {
    if (!isRightResizing) return;
    const windowWidth = window.innerWidth;
    const newWidth = windowWidth - e.clientX;
    
    // Set bounds
    if (newWidth < 350) {
      setRightPanelWidth(350);
    } else if (newWidth > 500) {
      setRightPanelWidth(500);
    } else {
      setRightPanelWidth(newWidth);
    }
  };

  const stopRightResize = () => {
    setIsRightResizing(false);
    document.removeEventListener("mousemove", handleRightResize);
    document.removeEventListener("mouseup", stopRightResize);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E] text-white">
      {/* Header/Navbar */}
      <header className="bg-[#1E1E1E] border-b border-gray-800 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-gray-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">RAG Explorer</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="bg-[#303030] hover:bg-[#404040] text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setUploadModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Upload Book</span>
          </button>
          
          <div className="flex items-center">
            <span className="mr-2 text-gray-300 text-sm">Current Book:</span>
            {isLoading ? (
              <div className="animate-pulse h-10 w-48 bg-gray-700 rounded-md"></div>
            ) : (
              <select 
                className="border border-gray-600 rounded-md px-3 py-2 bg-[#303030] text-white text-sm"
                value={selectedBook?.id || ""}
                onChange={handleBookChange}
                disabled={!books || books.length === 0}
              >
                {!books || books.length === 0 ? (
                  <option value="">No books available</option>
                ) : (
                  books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content area with three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Vector Store Creation */}
        <div 
          id="left-panel" 
          className="bg-[#252525] border-r border-gray-800 flex flex-col relative transition-all duration-300"
          style={{ width: leftPanelCollapsed ? '40px' : `${leftPanelWidth}px` }}
        >
          {leftPanelCollapsed ? (
            <div className="p-3 flex flex-col items-center h-full">
              <button 
                onClick={() => setLeftPanelCollapsed(false)}
                className="bg-[#303030] hover:bg-[#404040] rounded-full w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white"
                title="Expand Vector Store Creation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={() => setLeftPanelCollapsed(true)}
                  className="bg-[#303030] hover:bg-[#404040] rounded-full w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white"
                  title="Collapse Vector Store Creation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <VectorStoreCreator />
            </>
          )}
        </div>
        
        <div 
          className={`resizer ${isLeftResizing ? 'active' : ''}`} 
          onMouseDown={handleLeftResizeStart}
          style={{
            background: isLeftResizing ? '#555' : '#333',
            width: '5px',
            cursor: 'col-resize',
            display: leftPanelCollapsed ? 'none' : 'block',
          }}
        ></div>
        
        {/* Main panel: Chat Interface */}
        <div id="main-panel" className="flex-1 flex flex-col bg-[#1E1E1E]">
          {selectedBook && (
            <div className="px-4 pt-4">
              <div className="max-w-4xl mx-auto">
                <SuggestionMarquee onSuggestionClick={(suggestion) => {
                  // Create a custom event to pass the suggestion to ChatInterface
                  const event = new CustomEvent('useSuggestion', { detail: suggestion });
                  document.dispatchEvent(event);
                }} />
              </div>
            </div>
          )}
          <ChatInterface />
        </div>
        
        <div 
          className={`resizer ${isRightResizing ? 'active' : ''}`} 
          onMouseDown={handleRightResizeStart}
          style={{
            background: isRightResizing ? '#555' : '#333',
            width: '5px',
            cursor: 'col-resize',
            display: rightPanelCollapsed ? 'none' : 'block',
          }}
        ></div>
        
        {/* Right panel: Knowledge Graph Builder */}
        <div 
          id="right-panel" 
          className="bg-[#252525] border-l border-gray-800 flex flex-col relative transition-all duration-300"
          style={{ width: rightPanelCollapsed ? '40px' : `${rightPanelWidth}px` }}
        >
          {rightPanelCollapsed ? (
            <div className="p-3 flex flex-col items-center h-full">
              <button 
                onClick={() => setRightPanelCollapsed(false)}
                className="bg-[#303030] hover:bg-[#404040] rounded-full w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white"
                title="Expand Knowledge Graph Builder"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="absolute top-3 left-3 z-10">
                <button 
                  onClick={() => setRightPanelCollapsed(true)}
                  className="bg-[#303030] hover:bg-[#404040] rounded-full w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white"
                  title="Collapse Knowledge Graph Builder"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              </div>
              <KnowledgeGraphBuilder />
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
