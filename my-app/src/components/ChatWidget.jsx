import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// 마크다운 렌더링을 위한 라이브러리
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/**
 * AI 응답의 마크다운을 렌더링하고, 내부 링크를 처리하는 컴포넌트
 */
function MarkdownMessage({ children }) {
  const navigate = useNavigate();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        // 줄바꿈 및 여백 최적화
        p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="m-0 pl-5 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="m-0 pl-5 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="my-0.5">{children}</li>,

        // ✅ 링크 처리 로직
        a: ({ href, children, ...props }) => {
          const isInternal = href && href.startsWith("/");
          const isExternal = href && !href.startsWith("/");

          return (
            <a
              href={href}
              {...props}
              onClick={(e) => {
                if (isInternal) {
                  e.preventDefault(); // 페이지 새로고침 방지
                  navigate(href);     // 리액트 라우터로 이동
                }
              }}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              // ✅ 파란색 링크 스타일과 호버 효과 추가
              className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors cursor-pointer"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "안녕하세요! 도우미입니다. 무엇을 도와드릴까요?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const CHAT_API_BASE = "http://localhost:8000";

  // 메시지 발생 시 하단 스크롤
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 페이지 이동 시 챗봇 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  // 커스텀 이벤트 감지 시 챗봇 닫기
  useEffect(() => {
    const onSideDrawerOpen = () => setIsOpen(false);
    window.addEventListener("tp:SideDrawer-open", onSideDrawerOpen);
    return () => window.removeEventListener("tp:SideDrawer-open", onSideDrawerOpen);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${CHAT_API_BASE}/chat`, {
        query: userMsg.content,
      });

      let aiContent = response?.data?.response ?? "(응답 없음)";

      // ✅ [핵심 추가] (바로가기: /경로) 형태를 마크다운 링크 문법으로 자동 변환
      // 예: (바로가기: /login) -> [(바로가기: /login)](/login)
      aiContent = aiContent.replace(
        /\(바로가기:\s*(\/[^\)]+)\)/g, 
        "[(바로가기: $1)]($1)"
      );

      const aiMsg = {
        role: "ai",
        content: aiContent,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "서버와 통신 중 오류가 발생했습니다." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[9999] rounded-full shadow-lg px-4 py-3 bg-white/80 backdrop-blur-sm text-black border border-gray-300 hover:bg-white/90"
      >
        {isOpen ? "닫기" : "챗봇"}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-[9999] w-[540px] h-[780px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <div className="font-semibold">TripPeople 챗봇</div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm px-2 py-1 rounded text-gray-700 hover:bg-gray-200"
            >
              닫기
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={[
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-black text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md",
                  ].join(" ")}
                >
                  <div className="text-[11px] opacity-70 mb-1">
                    {msg.role === "user" ? "나" : "도우미"}
                  </div>

                  {/* ✅ AI 응답일 때만 마크다운 컴포넌트 적용 */}
                  {msg.role === "ai" ? (
                    <MarkdownMessage>{msg.content}</MarkdownMessage>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-xs text-gray-500">답변을 생각 중입니다...</div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* 입력 영역 */}
          <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 걸 물어보세요..."
              disabled={isLoading}
              className="basis-2/3 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="basis-1/3 rounded-xl px-2 py-2 text-sm bg-black text-black flex items-center justify-center disabled:opacity-50"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </>
  );
}