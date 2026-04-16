import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface TocEntry {
  id: string;
  text: string;
  level: number;
  numberStr: string;
}

export interface PostData {
  id: string;
  title: string;
  translatedTitle: string;
  url: string;
  author: string;
  score: number;
  commentsCount: number;
  date: string;
  summary: string;
  contentHtml: string;
  toc: TocEntry[];
}

export function getSortedPostsData(): Omit<PostData, 'contentHtml' | 'toc'>[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      summary: (matterResult.data.summary as string) || matterResult.content.slice(0, 200),
      ...(matterResult.data as Omit<PostData, 'id' | 'summary' | 'contentHtml' | 'toc'>)
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => ({
    id: fileName.replace(/\.md$/, '')
  }));
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  // Extract TOC headers with numbering
  const toc: TocEntry[] = [];
  const counts = [0, 0, 0, 0];
  const lines = matterResult.content.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      let text = match[2].trim();
      
      // Strip leading numbers (e.g., "1.", "1.1.") if Gemini already provided them
      text = text.replace(/^\d+(\.\d+)*\.?\s*/, '').trim();
      
      const levelIndex = level - 2;
      
      counts[levelIndex]++;
      for (let i = levelIndex + 1; i < counts.length; i++) counts[i] = 0;
      
      const numberStr = counts.slice(0, levelIndex + 1).join('.') + '.';
      const headerId = text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '');
      
      toc.push({ id: headerId, text, level, numberStr });
    }
  });

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  
  // Add IDs and Numbers to headers in HTML
  let contentHtml = processedContent.toString();
  toc.forEach(entry => {
    const tag = `h${entry.level}`;
    const escapedText = entry.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`<${tag}>${escapedText}<\/${tag}>`, 'g');
    // Prepend number to the heading inside the content
    contentHtml = contentHtml.replace(regex, `<${tag} id="${entry.id}">${entry.numberStr} ${entry.text}</${tag}>`);
  });

  return {
    id,
    contentHtml,
    toc,
    summary: (matterResult.data.summary as string) || '',
    ...(matterResult.data as Omit<PostData, 'id' | 'summary' | 'contentHtml' | 'toc'>)
  };
}
