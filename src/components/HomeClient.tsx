"use client"

import { motion } from "framer-motion"
import Link from 'next/link'
import { useEffect, useState, useMemo } from "react"

interface HomeClientProps {
  posts: any[]
}

export default function HomeClient({ posts }: HomeClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "comments">("recent")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filtering & Sorting logic
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.translatedTitle?.toLowerCase().includes(q) ||
        post.summary?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === "trending") {
      result.sort((a, b) => b.score - a.score)
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortBy === "comments") {
      result.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))
    }

    return result
  }, [posts, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] transition-colors duration-300 font-body">
      {/* Velog-style Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">👴</span>
            <span className="font-title">IT 노인정</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input 
                type="text"
                placeholder="버그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48 md:w-64"
              />
              <span className="absolute left-3 top-1.5 opacity-40">🔍</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Tabs (Sorting) */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="sm:hidden relative">
            <input 
              type="text"
              placeholder="버그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 shadow-sm focus:outline-none"
            />
            <span className="absolute left-4 top-3.5 opacity-40">🔍</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl gap-1">
              <button 
                onClick={() => setSortBy("trending")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${sortBy === "trending" ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"}`}
              >
                🔥 트렌딩
              </button>
              <button 
                onClick={() => setSortBy("recent")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${sortBy === "recent" ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"}`}
              >
                🕒 최신순
              </button>
              <button 
                onClick={() => setSortBy("comments")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${sortBy === "comments" ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"}`}
              >
                💬 댓글순
              </button>
            </div>
            
            <div className="hidden md:flex items-center text-sm font-bold text-slate-500 dark:text-gray-400 gap-2">
              <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
              총 {filteredAndSortedPosts.length}개
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedPosts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-500 text-lg">그런 버그는 못 주웠는디... 🧓</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-500 font-bold hover:underline"
              >
                검색 초기화하기
              </button>
            </div>
          )}

          {filteredAndSortedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-50 dark:border-gray-800 flex flex-col h-full"
            >
              <Link href={`/posts/${post.id}`} className="flex flex-col h-full group">
                {/* Thumbnail Area with Image or Gradient fallback */}
                <div className={`h-48 w-full relative overflow-hidden flex items-center justify-center text-white ${
                  post.image ? 'bg-gray-100 dark:bg-gray-800' : 
                  ['bg-gradient-to-br from-sky-400 to-indigo-500', 'bg-gradient-to-br from-rose-400 to-purple-500', 'bg-gradient-to-br from-amber-400 to-orange-500', 'bg-gradient-to-br from-emerald-400 to-teal-500', 'bg-gradient-to-br from-fuchsia-400 to-pink-500'][idx % 5]
                }`}>
                   {post.image ? (
                     <img 
                       src={post.image} 
                       alt={post.translatedTitle} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       onError={(e) => {
                         // 이미지 에러 시 그라데이션으로 폴백
                         (e.target as HTMLImageElement).style.display = 'none';
                         const parent = (e.target as HTMLImageElement).parentElement;
                         if (parent) {
                           parent.classList.add('bg-gradient-to-br', 'from-slate-400', 'to-slate-600');
                           const emoji = document.createElement('span');
                           emoji.innerText = '🛡️';
                           emoji.className = 'text-5xl opacity-40';
                           parent.appendChild(emoji);
                         }
                       }}
                     />
                   ) : (
                     <span className="text-5xl opacity-40 select-none relative z-10 transition-transform duration-500 group-hover:scale-110">🛡️</span>
                   )}
                   <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold leading-snug mb-2 line-clamp-2 text-slate-900 dark:text-white font-title group-hover:text-blue-600 transition-colors">
                    {post.translatedTitle || post.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1 font-body">
                    {post.summary || "번역 및 요약이 진행 중인 기사입니다..."}
                  </p>
                  
                  {/* Meta */}
                  <div className="text-[0.75rem] text-slate-400 dark:text-gray-500 font-medium">
                    <span suppressHydrationWarning>{isMounted ? new Date(post.date).toLocaleDateString() : '로딩 중...'}</span>
                    <span className="mx-1">·</span>
                    <span>{post.commentsCount || 0}개의 댓글</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1e1e1e]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-[10px]">👴</div>
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">by <b>버그줍는노인</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-gray-300">
                    <span className="text-xs font-bold">⭐ {post.score}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
