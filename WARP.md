# Project Rules

## Deployment Process

Khi user yêu cầu "deploy", thực hiện các bước sau theo thứ tự:

1. `git add -A` - Stage tất cả thay đổi
2. `git commit -m "..."` - Commit với message mô tả chi tiết các thay đổi
3. `git push` - Push lên remote repository
4. `vercel --prod` - Deploy lên Vercel production

## Commit Message Convention

- Sử dụng tiếng Việt có dấu
- Mô tả ngắn gọn ở dòng đầu
- Liệt kê chi tiết các thay đổi dưới dạng bullet points
