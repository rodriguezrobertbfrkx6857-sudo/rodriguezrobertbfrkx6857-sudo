# 上游与项目增量 / 贡献归属

本项目建立在 MIT 许可的 [OpenDot](https://github.com/athulsreekumar/opendot) 之上，使用 pi Agent Runtime。遵守上游许可和署名；完整 Electron 源码未在此公开。这里展示的是工程设计与经过筛选的实际模块，而不是宣称从零研发了通用 Agent 产品。

| 层次 | 来源与贡献边界 |
|---|---|
| 桌面应用基础 | Electron/React AppShell、原有 Dot/Connections/MCP、基础工具与审批/模型管理来自上游 OpenDot |
| 协作与任务可靠性 | 在 OpenDot 上扩展任务 DAG、独立运行、文件交接、SQLite 状态/lease/fence、恢复与 UNKNOWN 效果处理 |
| 安全和验证 | 扩展受控文件读写、参数绑定的一次性能力、真实回执/任务身份/哈希检查、宿主可信验收 |
| 记忆和技能 | 在原 MemoryService / Organisation Skills 上加入作用域、修订、候选测试/批准/撤销机制 |
| 框架验收 | 故障注入、Windows 打包 UI、确定性 HTTP fixture 和分版本测试记录；**完整 1123 项测试包含上游历史用例** |

部分实现与测试由 AI 编码工具辅助。个人在简历中应仅对确实参与的需求分析、架构选择、审查、调试和验收承担对应职责。这里不把 OpenDot 上游模块、pi 组件、模型权重或既有测试全部描述为个人原创。

## 本公开展示包含

- 明确版本的架构与贡献说明；
- 数个与可靠性相关的实际源文件及单元测试；
- 可公开的合成输出片段与限制；
- 未包含完整应用源代码、运行数据库、原始会话、密钥或未经审核的图片/安装包。

详细范围见 [PUBLICATION_SCOPE.md](PUBLICATION_SCOPE.md)。
