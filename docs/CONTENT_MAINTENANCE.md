# 网站内容维护说明

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

`kind` 支持 `source`（源码）、`website`（官网）、`demo`（体验网站）、`updates`（更新记录）。`approach` 可同时省略；不填写未经证实的个人贡献、完成状态、数据或成果。

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

现有托管地址：[Cimk3](https://cimk3-me.a2034379061.workers.dev/)。

## 首页、项目案例与阅读说明

- `public/data/home.json`：`featured` 保存三个推荐入口，以 `kind`（`project/post/work`）与 `refId` 引用现有清单；`reason` 与 `en.reason` 是推荐理由。`updates` 保存最近的真实事项，字段为 `id/date/title/description/to/en`，首页按日期倒序显示最多三条。
- 项目的 `zh/en.caseStudy` 包含 `scenario`（需求或场景）、`experience`（实际用法）、`tradeoff`（一次调整或取舍）。内容要简短，依据个人说明、项目 README 或更新记录，不虚构经历。
- 作品详情的 `readingGuide` 包含 `genre/relation/order` 及相同的 `en` 字段；`startChapter` 为正文入口，`relatedWorkId` 为关联作品，`updated` 仅表示阅读说明的整理日期。
- 章节 `kind` 使用 `story` 或 `reference`；正文数量与末章根据目录生成。没有可靠的章节发布时间时，不用说明整理日期冒充小说更新日期。
- 完整的配置检查还会核对推荐入口、关联作品、章节入口和案例双语字段。

## 本轮案例资料依据

墨记的动机来自作者本次说明；功能参考墨记本地 README，长说明滚动与应用内更新参考墨记官网的版本记录。Moji-Web 的使用方式与浏览器提醒限制参考其 README。方寸食光的动机来自作者说明，内容与大型摆件调整参考 [项目介绍](https://github.com/Cimk3/A-Bite-of-Time/blob/main/README.md) 和 [发布记录](https://github.com/Cimk3/A-Bite-of-Time/releases)。案例不把发布记录中的待实机复验项目写成已通过验收。

## 资源合集

资源目录为 `public/data/resources.json`，根对象的 `collections` 数组按文件顺序展示。资源首页为 `/#/resources`，合集详情为 `/#/resources/<合集ID>`。

每个合集包含 `id/category/title/description/cover/updated/items/en`：

- `id` 使用小写字母、数字及连字符，全目录唯一；`category` 只使用 `study`（学习）或 `game`（游戏）。
- `title/description` 为中文名称和简介，`en` 中提供对应英文。`updated` 是实际整理日期，使用 `YYYY-MM-DD`，不表示自动检测了所有外链。
- `cover` 指向 `public/` 内的封面，例如 `/images/resources/frontend.webp`。目前四张封面均单独生成，导出为 960×320 的 WebP；页面按比例铺满，不从整页设计图中裁取。
- `items` 为资源数组，允许暂时为空，资源数量由数组长度计算。

每条资源包含 `id/title/description/url/type/languages/en`，必要时加 `edition`：

- `id` 在当前合集内唯一；同一合集内不重复收录相同网址。
- `url` 只接受 HTTP/HTTPS，直接打开官方或原作者网页，不通过本站代理下载。
- `type` 为 `documentation`（文档）、`tool`（工具）或 `sample`（示例）。
- `languages` 使用非空数组，如 `["zh", "en"]`；`edition` 可设为 `bedrock`（基岩版）或 `java`（Java版）。它描述资源适用版本，不是网站语言。
- `title/description` 及 `en.title/en.description` 都要填写。说明保持一两句话，不写未经确认的“亲测”“我常用”等经历，也不添加下载量或评分。

搜索会同时检索中英文名称与说明。命中合集名称或简介时，包含该合集全部条目；分类与搜索共同生效。地址中的 `q`、`category` 保存当前条件，`category` 使用 `study/game`，省略表示全部。合集内搜索保留在同名查询参数中，返回合集页时继续沿用；清空搜索恢复完整内容。

`npm run check:content` 会检查资源字段、双语、重复 ID/链接、日期、地址格式和本地封面；不会在每次构建时联网探测外站。首批八条入口在设计规划阶段核对过网页，未进行第三方软件的安装或功能测试。

增加资源时先核实来源，写清用途与适用版本，补齐双语，再更新合集整理日期并运行检查。新增内容无需增加后端或数据库。

素材使用内置 Image Gen 独立生成。四张提示分别围绕：蓝白桌面上的前端学习笔记本、整理好的开发工具台、明亮方块世界与工作台、手柄及游戏桌面；统一为温和低饱和插画，无品牌标记或可读文字。最终资源位于 `public/images/resources/`。
