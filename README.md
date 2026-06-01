# Letterboxd x Douban Movie Shelf

自用电影网页，按三组榜单浏览：

- Letterboxd Top 500
- Most Fans on Letterboxd
- One Million Watched Club

## 打开方式

直接双击 `index.html` 即可。如果浏览器限制本地 `fetch`，用任意静态服务器打开：

```powershell
python -m http.server 5173
```

然后访问 `http://localhost:5173`。

## 数据位置

电影数据在 `data/movies.json`。每条电影支持这些字段：

- `title`: 英文名
- `chineseTitle`: 中文名
- `year`: 年份
- `director`: 导演
- `poster`: 海报图片路径，建议放在 `assets/posters`
- `letterboxdUrl`: Letterboxd 链接
- `doubanUrl`: 豆瓣链接
- `rating`: Letterboxd 平均分
- `watched`: Letterboxd watched 数
- `fans`: Letterboxd fans 数
- `lists`: 所属榜单和排名

`lists` 里的 `key` 可用：

- `top500`
- `mostFans`
- `millionWatched`

## 数据说明

Letterboxd 页面当前会对脚本访问触发 Cloudflare 验证，所以项目采用本地 JSON 数据驱动。`scripts/import_lists.py` 会从 ListChallenges 的公开镜像页导入完整榜单，再用豆瓣 suggest 接口自动补中文名、豆瓣链接和豆瓣海报。

```powershell
python scripts/import_lists.py
```

导入来源：

- Letterboxd Top 500：ListChallenges mirror, 2026-02-23, 500 部
- Top 250 Films with the Most Fans：ListChallenges mirror, 2025-06, 250 部
- Letterboxd One Million Watched Club：ListChallenges mirror, 2025-06-23, 549 部

豆瓣没有稳定公开 API。最可靠的方式是先按英文名/中文名搜索，再把正确的 `movie.douban.com/subject/.../` 链接写入 JSON。

Letterboxd 精确 watched 数和平均评分没有稳定公开批量接口；对未手动补全的电影，页面会显示榜单排名或 `Watched 1M+`。如果你后续补 `rating`、`watched`、`fans` 字段，页面会自动显示精确数字。
