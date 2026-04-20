#!/usr/bin/env python3
import requests
import json
import sys
import os
import argparse

import subprocess

# Configuration
API_URL = "https://blog.aimmar.ink/api/admin/post"
READ_API_URL = "https://blog.aimmar.ink/api/posts"
# 基于脚本位置自动推断仓库根目录（worker的父目录）
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(SCRIPT_DIR)
JSON_PATH = os.path.join(REPO_DIR, "src/data/posts.json")

# In a production environment, these should be environment variables.
# For this local agent tool, we keep them here for convenience.
CLIENT_ID = os.environ.get("CF_ACCESS_CLIENT_ID", "331397ba10ecaed35a9c731d9b29f3fa.access")
CLIENT_SECRET = os.environ.get("CF_ACCESS_CLIENT_SECRET", "f66491b550629fb4615b07e6e0ed5707010d6ef2a35c44ad66b23af548cf26a4")

def update_local_posts_json():
    print("\n🔄 Updating local posts.json and syncing with Git...")
    try:
        # 1. Fetch posts
        response = requests.get(READ_API_URL)
        response.raise_for_status()
        posts = response.json()
        
        # 2. Filter and Clean
        # ⚠️ 重要：posts.json 是文章列表索引，只存元数据，不存正文！
        # 正文存储在 D1 数据库，通过 API 按需获取。
        # 禁止字段: content, contentZh (防止文件过大和敏感数据泄露)
        ALLOWED_FIELDS = {'slug', 'title', 'titleZh', 'excerpt', 'excerptZh',
                          'date', 'category', 'categoryZh', 'readTime'}
        BLOCKED_FIELDS = {'content', 'contentZh', 'contentHtml'}

        cleaned_posts = []
        for post in posts:
            # Filter out test posts
            if 'test' in post.get('slug', '').lower() or 'test' in post.get('title', '').lower():
                continue

            # 防御性检查：如果 API 返回了正文字段，发出警告并删除
            for blocked in BLOCKED_FIELDS:
                if blocked in post:
                    print(f"⚠️  WARNING: API 返回了 '{blocked}' 字段，已自动剔除（posts.json 不存正文）")
                    post.pop(blocked, None)

            # 只保留白名单字段（防御性编程）
            cleaned_post = {k: post.get(k) for k in ALLOWED_FIELDS}
            cleaned_posts.append(cleaned_post)
            
        # 3. Write file
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(cleaned_posts, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Updated {JSON_PATH}")
        
        # 4. Git Push
        def run_git(args):
            return subprocess.run(args, check=True, cwd=REPO_DIR, capture_output=True, text=True)

        run_git(["git", "add", "src/data/posts.json"])
        
        # Check if there are changes to commit
        status = subprocess.run(["git", "status", "--porcelain"], cwd=REPO_DIR, capture_output=True, text=True)
        if status.stdout.strip():
            run_git(["git", "commit", "-m", "feat: auto update posts.json"])
            print("✅ Git committed.")
            
            # Push
            print("🚀 Pushing to remote...")
            run_git(["git", "push"])
            print("✅ Git pushed successfully.")
        else:
            print("ℹ️ No changes to commit.")

    except Exception as e:
        print(f"❌ Failed to update local json/git: {e}")

def post_blog(data):
    headers = {
        "Content-Type": "application/json",
        "CF-Access-Client-Id": CLIENT_ID,
        "CF-Access-Client-Secret": CLIENT_SECRET
    }

    try:
        # 填充缺失字段的默认值，避免 D1 undefined 错误
        defaults = {
            'excerpt': '',
            'excerptZh': '',
            'categoryZh': '',
            'readTime': '5 min read',
            'contentType': 'markdown',
            'htmlPath': None,
            'contentHtml': None
        }
        for key, default_val in defaults.items():
            if key not in data or data[key] is None:
                data[key] = default_val
                print(f"ℹ️  填充默认值: {key} = {default_val!r}")

        # Quality Check: Bilingual Validation
        if data.get('title') == data.get('titleZh'):
            print("⚠️  WARNING: 'title' and 'titleZh' are identical. Did you forget to translate?")
        if data.get('content') == data.get('contentZh'):
            print("⚠️  WARNING: 'content' and 'contentZh' are identical. Did you forget to translate?")
        
        print(f"🚀 Publishing post: {data.get('title', 'Untitled')} ({data.get('slug', 'no-slug')})...")
        response = requests.post(API_URL, headers=headers, json=data)
        
        print(f"Status Code: {response.status_code}")
        if 200 <= response.status_code < 300:
            print("✅ Successfully published!")
            print(f"Response: {response.text}")
            
            # Auto update local JSON and push to Git
            update_local_posts_json()
        else:
            print("❌ Failed to publish.")
            print(f"Response: {response.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Publish a blog post to the Aimmar Blog API.")
    parser.add_argument("file", nargs="?", help="Path to the JSON file containing the blog post data. Use '-' for stdin.")
    
    args = parser.parse_args()

    data = None

    # 1. Try reading from file argument
    if args.file:
        if args.file == '-':
            try:
                data = json.load(sys.stdin)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from stdin: {e}")
                sys.exit(1)
        else:
            try:
                with open(args.file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except FileNotFoundError:
                print(f"Error: File '{args.file}' not found.")
                sys.exit(1)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from file: {e}")
                sys.exit(1)
    
    # 2. If no file argument, check if data is piped to stdin
    elif not sys.stdin.isatty():
        try:
            data = json.load(sys.stdin)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from stdin: {e}")
            sys.exit(1)
    
    else:
        parser.print_help()
        print("\nError: No input provided. Please provide a JSON file or pipe JSON data.")
        sys.exit(1)

    if data:
        post_blog(data)

if __name__ == "__main__":
    main()