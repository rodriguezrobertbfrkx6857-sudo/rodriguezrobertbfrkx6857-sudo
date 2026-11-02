# 源码选摘 / Selected Source Excerpts

选摘来自 OpenDot Enhanced 冻结工程源码 `f3fee23588e1963ae9eecd47d8c5e2170ef9dbb7`。为了展示 Agent Harness 的核心工程设计，只收录下列 **实际 TypeScript 源文件/测试**；未重写为新模拟程序。

| 私有工程原始路径（相对项目） | 本公开对应文件 | 核心设计 |
|---|---|---|
| `desktop/src/shared/cooperation.ts` | [cooperation.ts](src/shared/cooperation.ts) | DAG/任务/能力 Schema |
| `desktop/src/main/cooperation/durable-ledger.ts` | [durable-ledger.ts](src/main/cooperation/durable-ledger.ts) | SQLite checkpoint/lease/fencing |
| `desktop/src/main/cooperation/action-gateway.ts` | [action-gateway.ts](src/main/cooperation/action-gateway.ts) | 单次授权与参数绑定 |
| `desktop/src/main/cooperation/task-verifier.ts` | [task-verifier.ts](src/main/cooperation/task-verifier.ts) | 文件/回执/任务身份核验 |
| `desktop/src/main/models/task-router.ts` | [task-router.ts](src/main/models/task-router.ts) | 确定性模型候选路由 |
| `desktop/src/main/cooperation/durable-ledger.test.ts` | [durable-ledger.test.ts](src/main/cooperation/durable-ledger.test.ts) | 持久状态/租约反例 |
| `desktop/src/main/cooperation/action-gateway.test.ts` | [action-gateway.test.ts](src/main/cooperation/action-gateway.test.ts) | 单次授权合约测试 |
| `desktop/src/main/cooperation/task-verifier.test.ts` | [task-verifier.test.ts](src/main/cooperation/task-verifier.test.ts) | 旧 run、伪回执、错误身份等校验 |

**这些文件是选摘，不是独立可运行包。** 其部分 import 依赖未公开的同项目模块；本目录没有复制全部上游 AppShell、依赖、测试夹具或私有构建产物。完整 1123 项测试与 34 项 E2E 的结果是原完整工程内部的版本化验收摘要，**不能仅靠选摘重新运行**。

使用时遵循 [MIT](../LICENSE) 及 [上游署名](../CONTRIBUTIONS.md)。如需展示可重现的完整应用，必须后续另行审查和发布完整依赖与源码，而不能以选摘冒充。
