import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

async function fetchHtmlText(url: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HN-Auto-Blog/1.0' } });
    if (!res.ok) return { text: '', ogImage: '' };
    const html = await res.text();
    const $ = cheerio.load(html);

    // og:image 추출
    const ogImage = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') || '';

    // 불필요한 태그 날리기
    $('script, style, nav, header, footer, noscript, iframe').remove();
    let text = $('body').text();

    // 가벼운 정리
    text = text.replace(/\s+/g, ' ').trim();
    return { text: text.substring(0, 10000), ogImage };
  } catch (err) {
    console.error(`URL 파싱 실패 ${url}:`, err);
    return { text: '', ogImage: '' };
  }
}

async function main() {
  if (!GROQ_API_KEY) {
    console.warn("⚠️ GROQ_API_KEY가 없습니다! .env 파일에 세팅해주세요.");
  }

  const postsDir = path.join(process.cwd(), 'posts');
  await fs.mkdir(postsDir, { recursive: true });

  console.log('해커뉴스 가져오는 중...');

  // 커맨드라인 인자로 ID를 받았는지 확인 (수동 작업용)
  const argId = process.argv[2];
  let targetIds: number[] = [];

  if (argId && !isNaN(parseInt(argId))) {
    console.log(`수동 모드: 게시물 ID ${argId}를 직접 가져옵니다.`);
    targetIds = [parseInt(argId)];
  } else {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds: number[] = await topRes.json();
    // 상위 5개 뽑기
    targetIds = topIds.slice(0, 10);
  }

  for (const id of targetIds) {
    console.log(`\n게시물 ${id} 처리 중...`);
    const mdPath = path.join(postsDir, `${id}.md`);

    const exists = await fs.access(mdPath).then(() => true).catch(() => false);
    if (exists) {
      console.log(`게시물 ${id}은(는) 이미 있어서 패스함 ㅇㅇ`);
      continue;
    }

    const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const item = await itemRes.json();

    if (!item || item.type !== 'story') continue;

    console.log(`원문 제목: ${item.title}`);

    let contentToProcess = item.text || '';
    let thumbnail = '';

    if (item.url) {
      console.log(`본문 긁어오는 중... (${item.url})`);
      const siteData = await fetchHtmlText(item.url);
      if (siteData.text) {
        contentToProcess = siteData.text;
      }
      thumbnail = siteData.ogImage;
    }

    let translatedTitle = item.title;
    let summary = '이 글은 내용이 없거나 요약할 수 없습니다';
    let fullTranslation = '';

    // 갓성비 Groq(Llama3)로 번역과 요약을 한 번에 처리
    if (groq && (contentToProcess || item.title)) {
      console.log(`Groq(Llama 3)로 번역 & 전체 본문 작업 드가는 중...`);
      const prompt = `너는 해커뉴스(Hacker News)의 최신 기술 정보를 한국 IT 커뮤니티(디시인사이드, 펨코 등) 감성으로 전달하는 전문 블로거야.
다음 정보를 바탕으로 JSON 형식으로 출력해줘.

1. 제목 원문: "${item.title}"
2. 기사 본문(일부): "${contentToProcess.substring(0, 15000)}"

출력 양식(JSON):
{
  "translatedTitle": "기사 제목을 자연스럽고 찰진 한국어로 번역해서 넣어줘",
  "summary": "1~2줄 정도의 매우 짧은 요약(카드 미리보기용)",
  "fullTranslation": "본문 전체를 한국어로 번역해서 마크다운 형식으로 넣어줘. 
                    ## 또는 ### 같은 헤더를 적극적으로 사용해서 나무위키처럼 구조화해줘. 
                    말투는 친근한 개발자 할배 느낌(반말과 존댓말 섞어서 찰지게)으로 해줘."
}

JSON 외의 다른 텍스트는 절대 출력하지 말고 무조건 완벽한 JSON 형식만 출력해.`;

      // 재시도 로직 (최대 3번)
      let retries = 3;

      while (retries > 0) {
        try {
          console.log(`[시도 ${4 - retries}/3] llama-3.3-70b-versatile 모델로 생성 중...`);
          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
          });
          const responseText = chatCompletion.choices[0]?.message?.content || "";

          // JSON 파싱 자동 (response_format 지정으로 json_object만 옴)
          const parsed = JSON.parse(responseText);
          translatedTitle = parsed.translatedTitle || translatedTitle;
          summary = parsed.summary || summary;
          fullTranslation = parsed.fullTranslation || '';
          
          break; // 성공하면 루프 탈출
        } catch (err: any) {
          console.error(`Groq 처리 에러 (${err.statusText || err.message}): 남은 재시도 ${retries - 1}`);
          retries--;
          if (retries === 0) {
            console.error('⚠️ 최대 재시도 횟수 초과. 이번 기사는 기본 메타데이터만 저장합니다.');
          } else {
            console.log(`서버 폭주 방지: 5초 대기 후 다시 시도합니다...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
    }

    // AI 요약에 실패했거나 원문 자체가 너무 부실한 경우 업로드 스킵
    if (!fullTranslation || summary === '이 글은 내용이 없거나 요약할 수 없습니다') {
      console.warn(`⚠️ 요약 실패(또는 내용 부족)로 게시물 ${id} 저장을 건너뜁니다.`);
      continue;
    }

    const date = new Date(item.time * 1000).toISOString();

    const mdContent = `---
id: "${item.id}"
title: "${item.title.replace(/"/g, '\\"')}"
translatedTitle: "${translatedTitle.replace(/"/g, '\\"')}"
url: "${item.url || `https://news.ycombinator.com/item?id=${item.id}`}"
author: "${item.by}"
score: ${item.score}
commentsCount: ${item.descendants || 0}
date: "${date}"
summary: "${summary.replace(/"/g, '\\"')}"
image: "${thumbnail}"
---

${fullTranslation || summary}
`;

    await fs.writeFile(mdPath, mdContent, 'utf-8');
    console.log(`저장 완료: ${id}.md`);
  }

  console.log('\n모든 작업 끗!');
}

main().catch(console.error);
