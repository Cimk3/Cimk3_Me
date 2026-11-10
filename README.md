# Cimk3 个人网站

Vue 3 + Element Plus 的纯静态个人网站，使用 JSON 管理结构化内容，Markdown 保存正文。

## 开发与检查

```sh
npm install
npm run serve
npm run check:content
npm test
npm run build
```

`npm run build` 会先运行内容检查，错误会阻止构建。生产产物在 `dist/`，本地修改不会自动发布。

## 内容位置与双语

| 内容 | 位置 | 双语范围 |
| --- | --- | --- |
| 首页资料 | `public/data/profile.json` | `zh/en` 中的标语与简介 |
| 项目 | `public/data/projects.json` | `zh/en` 中的标题、简介、标签、亮点与可选制作方式 |
| 文章 | `public/data/posts.json`、`public/blog/*.md` | 标题、摘要；正文保留中文 |
| 灵感 | `public/data/inspirations.json`、`public/inspirations/*.md` | 标题；正文保留中文 |
| 作品 | `public/data/works.json`、`public/works/*.json` | 标题、简介与章节目录；正文保留中文 |
| 小说正文 | `public/chapters/<作品ID>/<章节ID>.md` | 保留中文 |
| 联系方式 | `public/data/contacts.json` | 渠道名称由 `key` 对应界面翻译 |
| 音乐 | `public/data/music.json` | 歌单名称保留原文，播放反馈双语 |

文章、灵感、作品、章节保留原有顶层中文字段，并增加 `en` 对象。例如：

```json
{
  "slug": "hello",
  "title": "你好",
  "summary": "第一篇文章",
  "date": "2026-11-10T20:00:00+08:00",
  "md": "/blog/hello.md",
  "en": { "title": "Hello", "summary": "My first post" }
}
```

缺少英文时，页面按字段回退中文；检查命令会报告缺译，发布前应补齐。英文界面会提示正文为中文，并为中文正文设置独立语言标记。

## 项目卡片

每个项目使用稳定的 `id`，同一项目的多个入口放入 `links`。墨记的仓库和官网共用一张卡片。

```json
{
  "id": "example",
  "zh": {
    "title": "项目名称",
    "description": "项目介绍",
    "tags": ["Vue3"],
    "highlights": ["能够核实的功能亮点"],
    "approach": "可选：有依据的制作方式说明"
  },
  "en": {
    "title": "Project name",
    "description": "Project description",
    "tags": ["Vue3"],
    "highlights": ["A verified feature"],
    "approach": "Optional: a supported description of how it was made"
  },
  "links": [{ "kind": "source", "href": "https://example.com/repo" }]
}
```

`kind` 支持 `source`（源码）、`website`（官网）、`demo`（体验网站）。`approach` 可同时省略；不填写未经证实的个人贡献、完成状态、数据或成果。

## 日期与标题

- 文章使用含秒与时区的 ISO 时间，如 `2026-11-10T20:00:00+08:00`；灵感使用 `YYYY-MM-DD`。
- 文章和灵感按时间倒序，同一时间保持文件顺序；作品和章节保持作者指定顺序。
- 日期按上海时区显示，格式随中英文切换。
- 浏览器标题使用具体文章、作品、章节名称，切换语言同步更新。

## 检查内容

`npm run check:content` 汇总报告 JSON 语法、必需字段、双语缺译、日期、重复标识及本地资源问题。

- 文章 `slug`、项目/作品/灵感 `id` 在所属清单内唯一。
- 章节 `id` 在所属作品内唯一，不同作品可使用相同章节 ID。
- 联系方式 `value`、音乐 `src` 不重复。
- 列表引用的作品详情、章节正文、图片、音频、Markdown 内本地链接和模板固定资源必须存在；文件名大小写必须一致。
- 站内资源路径按网站根目录（`public/`）解析，推荐 `/images/...` 等写法；项目与联系外链检查 HTTP/HTTPS 格式，不联网检测其可用性。

`npm test` 使用临时样本验证内容检查和交互状态，不修改正式内容。

## 更新与发布

开发预览中修改 `public/` 后，重新进入页面或使用重试加载新内容。正式站点需重新部署更新后的静态文件；仅修改源码目录中的 `public/` 不会改变已发布网站。推荐检查通过后重新构建并部署完整 `dist/`，避免文件不同步。

现有托管地址：[Cimk3](https://cimk3-me.a2034379061.workers.dev/)。本次改动不包含部署、提交或推送。
