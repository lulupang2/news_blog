"use client"

import { motion } from "framer-motion"
import Link from 'next/link'
import { useEffect, useState } from "react"
import { PostData } from '@/lib/posts'

export default function PostClient({ post }: { post: PostData }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isTocVisible, setIsTocVisible] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] flex flex-col transition-colors duration-300 font-body">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-2xl">👴</span>
            <span className="hidden sm:inline font-title">버그 줍는 노인</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Nav links could go here if needed */}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Side: Main Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="mb-10">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight font-title">
                {post.translatedTitle || post.title}
              </h1>

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm">👴</div>
                  <div>
                     <div className="font-bold text-slate-900 dark:text-white">버그줍는노인</div>
                     <div className="text-sm text-slate-400 font-medium" suppressHydrationWarning>
                       {isMounted ? new Date(post.date).toLocaleDateString() : '로딩 중...'}
                     </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                    ⭐ {post.score} points
                  </div>
                </div>
              </div>

              {/* Namuwiki-style Content Box (Summary) */}
              <div className="bg-gray-50 dark:bg-[#1e1e1e] border-l-4 border-blue-500 p-6 mb-10 rounded-r-lg">
                <p className="text-slate-700 dark:text-gray-300 italic leading-relaxed">
                   " {post.summary} "
                </p>
              </div>

              {/* Namuwiki-style TOC (Authentic) */}
              {post.toc && post.toc.length > 0 && (
                <div className="mb-12 bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-[#ccc] dark:border-gray-700 p-4 sm:p-5 inline-block min-w-[280px] rounded shadow-sm text-sm">
                  <div className="font-bold text-center mb-3 flex items-center justify-center gap-3">
                    <span className="font-title">목차</span>
                    <button 
                      onClick={() => setIsTocVisible(!isTocVisible)}
                      className="text-[0.7rem] text-blue-600 dark:text-blue-400 hover:underline font-normal"
                    >
                      [{isTocVisible ? '숨기기' : '보이기'}]
                    </button>
                  </div>
                  {isTocVisible && (
                    <ul className="space-y-1 text-[0.9rem]">
                      {post.toc.map((entry, idx) => (
                        <li key={idx} style={{ paddingLeft: `${(entry.level - 2) * 1.25}rem` }}>
                          <a href={`#${entry.id}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-start gap-1.5">
                            <span className="font-bold flex-shrink-0">{entry.numberStr}</span> 
                            <span>{entry.text}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </header>

            {/* Article Content */}
            <section className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-title prose-p:font-body 
              prose-a:text-blue-600 dark:prose-a:text-blue-400 
              prose-headings:scroll-mt-20 
              prose-h2:border-b prose-h2:border-[#ccc] dark:prose-h2:border-gray-800 
              prose-h2:pb-2 prose-h2:mt-16
              text-slate-800 dark:text-slate-200"
            >
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </section>

            <footer className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-3xl">👴</div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white font-title">버그줍는노인</div>
                    <p className="text-slate-500 dark:text-gray-400">보안 이슈 줍줍하는 친절한 개발자 할배의 블로그. 틀린 말 있으면 네 말이 맞음 ㅇㅇ.</p>
                  </div>
               </div>
               <div className="mt-8">
                  <Link href="/" className="inline-flex items-center px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                     ← 리스트로 돌아가기
                  </Link>
               </div>
            </footer>
          </motion.div>
        </div>

        {/* Desktop Sidebar TOC */}
        {post.toc && post.toc.length > 0 && (
          <aside className="hidden lg:block w-74 flex-shrink-0 sticky top-24 h-fit max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
            <div className="bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-[#ccc] dark:border-gray-700 p-5 rounded shadow-sm">
              <div className="font-bold text-base mb-4 text-slate-900 dark:text-white font-title flex items-center gap-2 border-b border-[#ccc] dark:border-gray-700 pb-2">
                목차
              </div>
              <ul className="space-y-2.5 text-[0.85rem]">
                {post.toc.map((entry, idx) => (
                  <li key={idx} style={{ paddingLeft: `${(entry.level - 2) * 0.75}rem` }} className="leading-tight">
                    <a href={`#${entry.id}`} className="text-blue-600 dark:text-blue-400 hover:underline flex gap-2">
                      <span className="font-bold flex-shrink-0">{entry.numberStr}</span> 
                      <span>{entry.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
