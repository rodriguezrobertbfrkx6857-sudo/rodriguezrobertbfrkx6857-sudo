# AI / Agent · Software Systems · Scientific Computing

武汉理工大学数学相关专业本科在读（2028 届）。目前主要关注 **代码智能体、检索增强生成（RAG）、Agent 可靠执行与软件系统评测**，同时保持算法、科学计算和工程工具方面的实践。

这里按**代表性科研/工程项目 → 相关研究 → 其他公开作品**整理。项目中的验证数字均有具体适用范围；完整私有工程与公开示例会明确区分。

## 代表项目 · Featured Projects

### 01 · [百骑谱 Baiqipu｜知识检索与可溯源 Research 工作流](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/tree/main/projects/steedatlas-showcase)

面向名马文化资料的知识检索、问答与内容工作流。原项目使用 **FastAPI / SQLAlchemy** 组织领域资料与后端服务，围绕中文别名、**BM25 检索、来源版本与文本哈希/引用区间校验**，探索可复查的回答依据，以及受限工具调用和持久化任务编排。

- **公开可查看：** [工程缩小版与运行说明](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/tree/main/projects/steedatlas-showcase) · [简历用技术摘要](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/blob/main/projects/steedatlas-showcase/docs/RESUME_PROJECT.md)
- **证据范围：** 公开合成演示有 25 项回归测试记录；原私有项目另有 104 项后端测试通过的历史验收记录。两者不混用，资料引用核验也不等同于历史事实审定。

### 02 · [Gemma 4 Developer Agent｜仓库级代码修复与证据校验](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/tree/main/projects/gemma4-coding-agent)

围绕 Python 软件仓库中的 Issue 修复任务，研究 Agent 从代码定位、工具调用、文件编辑、Patch 生成到独立测试的过程。公开选摘包含 **源码 SHA 版本校验、多文件写前预检、AST 检查、失败回滚、补丁审计与评测回执关联**等组件。

- **公开可查看：** [核心组件与合成测试](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/tree/main/projects/gemma4-coding-agent) · [历史 FastAPI 修复案例](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio/tree/main/projects/gemma4-coding-agent/demo)
- **证据范围：** 案例回放对应一个已知任务、11 项测试通过记录；它不是 11 个修复任务，也不代表未知任务成功率或 Kaggle 获奖。完整竞赛与实验仓库仍未公开。

### 03 · [OpenDot Enhanced｜多 Agent 可靠执行框架](https://github.com/rodriguezrobertbfrkx6857-sudo/rodriguezrobertbfrkx6857-sudo/tree/master/projects/opendot-enhanced)

基于开源 **OpenDot / pi** 的框架扩展，关注多 Agent 任务 DAG、独立会话、工具权限审批、**SQLite 状态持久化、租约/fencing、任务中断恢复**，以及文件哈希和执行回执验证，减少“声称完成但未交付”的情况。

- **公开可查看：** [架构、验证边界与工程说明](https://github.com/rodriguezrobertbfrkx6857-sudo/rodriguezrobertbfrkx6857-sudo/blob/master/projects/opendot-enhanced/README.md) · [TypeScript 源码选摘](https://github.com/rodriguezrobertbfrkx6857-sudo/rodriguezrobertbfrkx6857-sudo/tree/master/projects/opendot-enhanced/code-excerpts)
- **证据范围：** 原完整工程记录 1,123 项回归通过（包含上游基线）、34/34 UI E2E（FakeProvider）；公开内容是选摘，不是完整可运行桌面应用或真实模型自治能力证明。

## 相关研究与算法实践

| 项目 | 主要内容 |
| --- | --- |
| [信源·智鉴 / RAG Poisoning Detection](https://github.com/rodriguezrobertbfrkx6857-sudo/rag-poisoning-detection-trusted-provenance) | RAG 知识库投毒检测、来源核验、冲突图谱与本地演示 |
| [AI Evaluation Benchmark Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/ai-evaluation-benchmark-lab) | 复杂指令、任务规划、搜索证据的任务契约与可复现评测 |
| [CP-Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/cp-lab) | C++ / Python 算法实现、交互可视化、正确性测试与性能比较 |
| [Scientific Reproducibility Kit](https://github.com/rodriguezrobertbfrkx6857-sudo/scientific-reproducibility-kit) | 实验环境、源码哈希、基准数据与结论的一致性校验 |

## GPU / AI4S · 科学计算实验

这条支线研究 GPU Kernel、科学算子和实验验证方法。部分公开结果来自 **CPU-only 环境**，不将其表述为已完成 CUDA 实测加速。

| 项目 | 实验主题 |
| --- | --- |
| [Agentic GPU Optimizer](https://github.com/rodriguezrobertbfrkx6857-sudo/agentic-gpu-optimizer) | AI 优化建议 → Patch → 正确性/基准 → 接受或拒绝的证据闭环 |
| [GPU Kernel Performance Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/gpu-kernel-performance-lab) | 转置、归约、Warp Shuffle、Tiled GEMM 等 CUDA 内核实验 |
| [Spectral Operator GPU Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/spectral-operator-gpu-lab) | Fourier Neural Operator 频域收缩与可选 CUDA 扩展 |
| [AI4S Scientific Operator Agent](https://github.com/rodriguezrobertbfrkx6857-sudo/ai4s-scientific-operator-agent) | Poisson/Jacobi stencil、误差指标与优化决策 |
| [Quantum Statevector GPU Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/quantum-statevector-gpu-lab) | 单比特量子门的状态矢量布局、参考实现与 CUDA 路径 |

## 开发工具与质量工程

| 项目 | 解决的问题 |
| --- | --- |
| [MCP Workbench](https://github.com/rodriguezrobertbfrkx6857-sudo/mcp-workbench) | MCP 服务 Schema 检查、工具调试与调用审计 |
| [QA Sentinel](https://github.com/rodriguezrobertbfrkx6857-sudo/qa-sentinel) | Playwright 页面巡检、响应式检查与证据报告 |
| [Data Cleanroom Studio](https://github.com/rodriguezrobertbfrkx6857-sudo/data-cleanroom-studio) | 本地 CSV/JSON 数据清洗、规则校验与审计导出 |
| [Document Pipeline Studio](https://github.com/rodriguezrobertbfrkx6857-sudo/document-pipeline-studio) | 文档解析、结构化抽取、来源追踪与 diff |
| [Webhook Observatory](https://github.com/rodriguezrobertbfrkx6857-sudo/webhook-observatory) | Webhook HMAC、契约验证、重放与故障诊断 |
| [BrowserOps Capture](https://github.com/rodriguezrobertbfrkx6857-sudo/browserops-capture) | 最小权限浏览器数据采集与本地导出 |

<details>
<summary><strong>其他应用与跨领域作品（展开）</strong></summary>

| 项目 | 简介 |
| --- | --- |
| [AudioRelay](https://github.com/rodriguezrobertbfrkx6857-sudo/audio-relay) | Windows WASAPI → WebSocket → iPad 浏览器的局域网音频原型 |
| [AStock Quant Console](https://github.com/rodriguezrobertbfrkx6857-sudo/astock-quant-console) | 本地量化研究工作台框架、因子分析与回测模块 |
| [TongueAI / T4 Research Package](https://github.com/rodriguezrobertbfrkx6857-sudo/tcm-sizhen-ai-cloudstudio-t4) | 舌象视觉模型加载与评测迁移准备；不用于临床诊断 |
| [Godot 3D Environment Showcase](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-3d-environment-showcase) | 实时 3D 场景、材质、光照与交互 |
| [Godot 3D Scene Audit Toolkit](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-3d-scene-audit-toolkit) | 场景和材质质量检查 |
| [Godot Material & Lighting Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-material-lighting-lab) | PBR 材质与光照方案对比 |
| [ContractLens](https://github.com/rodriguezrobertbfrkx6857-sudo/contract-lens-ai) | 人工审批的合同条款风险演示 |
| [SupportPilot](https://github.com/rodriguezrobertbfrkx6857-sudo/support-pilot-ai) | 工单分诊、SLA 优先级与人工审核工作流 |
| [RevOps Pulse](https://github.com/rodriguezrobertbfrkx6857-sudo/revops-pulse) | 销售管道状态、风险和预测演示 |

上述应用演示中的业务数据为合成数据；每个仓库的 README 会说明实际实现及限制。

</details>

## 技术与工作方式

**常用语言与工具：** Python · C++ · MATLAB · TypeScript · Git · Linux · FastAPI · SQLite · pytest / Playwright。持续使用 Codex，并使用 Claude、Antigravity、Cursor 辅助开发；重视对生成代码的独立检查与测试。

**主要关注：** 数学与算法基础、可复现的实验、清晰的权限边界、失败场景的处理，以及“代码确实运行、修改确实落盘、结果确有证据”的工程验证。

更多项目及各自的公开范围请见 [全部公开仓库](https://github.com/rodriguezrobertbfrkx6857-sudo?tab=repositories) 与 [精选技术作品集](https://github.com/rodriguezrobertbfrkx6857-sudo/xpert-portfolio)。完整私有仓库、数据和实验材料不会因为出现在主页简介中而自动公开。
