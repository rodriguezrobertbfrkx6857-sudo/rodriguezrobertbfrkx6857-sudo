# GPU/CUDA + AI4S 技术作品集

面向 2026 书生国智科探挑战赛·飞翔杯的公开技术作品集，围绕三个问题展开：如何写出可验证的 GPU Kernel，如何把 AI 优化建议放进证据闭环，以及如何把科学计算原型交付成可复现系统。

## 代表项目

| 项目 | 关注点 | 当前公开证据 |
|---|---|---|
| [Agentic GPU Optimizer](https://github.com/rodriguezrobertbfrkx6857-sudo/agentic-gpu-optimizer) | AI 辅助 Kernel 优化闭环 | patch 校验、隔离构建、正确性、基准、三态决策 |
| [GPU Kernel Performance Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/gpu-kernel-performance-lab) | CUDA 内存与线程层优化 | transpose、reduction、warp shuffle、tiled GEMM |
| [Spectral Operator GPU Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/spectral-operator-gpu-lab) | FNO 频域算子优化 | PyTorch reference、complex64 CUDA 扩展、融合路径 |

## 科学计算与证据层

- [AI4S Scientific Operator Agent](https://github.com/rodriguezrobertbfrkx6857-sudo/ai4s-scientific-operator-agent)：Poisson/Jacobi stencil 与科学误差门禁。
- [Quantum Statevector GPU Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/quantum-statevector-gpu-lab)：态矢量单比特门、pair update 与布局验证。
- [Scientific Reproducibility Kit](https://github.com/rodriguezrobertbfrkx6857-sudo/scientific-reproducibility-kit)：环境、基准、决策、源码哈希和 manifest 校验。

## 系统工程作品

- [信源·智鉴](https://github.com/rodriguezrobertbfrkx6857-sudo/rag-poisoning-detection-trusted-provenance)：RAG 知识库投毒检测、可信溯源、冲突图谱和自净化原型。
- [AudioRelay](https://github.com/rodriguezrobertbfrkx6857-sudo/audio-relay)：Windows WASAPI 到 iPad Safari 的局域网 PCM 音频中继。

## 本地优先开发工具

| 项目 | 关注点 | 可验证内容 |
|---|---|---|
| [MCP Workbench](https://github.com/rodriguezrobertbfrkx6857-sudo/mcp-workbench) | MCP 服务检查与安全调试 | JSON Schema 探索、风险分类、调用历史、Vitest/CI |
| [QA Sentinel](https://github.com/rodriguezrobertbfrkx6857-sudo/qa-sentinel) | 自动化 Web 质量门禁 | Playwright 多视口检查、缺陷夹具、HTML/Markdown/JSON 报告 |
| [Data Cleanroom Studio](https://github.com/rodriguezrobertbfrkx6857-sudo/data-cleanroom-studio) | 本地数据清洗与质量校验 | 画像、去重、规范化、规则验证、审计导出 |
| [Webhook Observatory](https://github.com/rodriguezrobertbfrkx6857-sudo/webhook-observatory) | Webhook 观测与故障恢复 | HMAC 验证、契约检查、重放 diff、有限重试 |
| [BrowserOps Capture](https://github.com/rodriguezrobertbfrkx6857-sudo/browserops-capture) | 隐私优先网页采集 | Manifest V3、activeTab、本地 DOM 提取、多格式导出 |
| [Document Pipeline Studio](https://github.com/rodriguezrobertbfrkx6857-sudo/document-pipeline-studio) | 文档解析与结构化抽取 | FastAPI、PDF/CSV/JSON 解析、来源追溯、逐行 diff |

## 复现原则

每个仓库都保留源代码、测试、结构化结果和 GitHub Actions。性能结论遵循“正确性 → 预热 → 重复测量 → 同步 → 统计 → 决策”的顺序；只有实际 CUDA 执行、正确性通过且环境证据完整时，才允许形成 CUDA 性能结论。

当前公开 checkout 的 CUDA 报告是在无 NVIDIA GPU、无 `nvcc` 的主机上生成的 CPU-only 证据。CPU 结果用于验证算法和实验流程，不冒充 GPU 加速；后续 CUDA 主机结果会单独保存 GPU 型号、驱动、Toolkit、原始 JSON 和 profiler 导出。

## 公开工程标准

- 中文 README、可复制命令和明确的限制说明。
- 服务项目提供 API/协议契约测试和 CI smoke 验证。
- 不提交虚拟环境、构建目录、运行数据库、日志或本机绝对路径。
- 不把历史归档记录包装成本次独立验收结果。
## 3D / Interactive Media

A focused Godot 4.7 portfolio set for real-time 3D environment work, technical-art review, and interactive media prototyping. The projects are procedural and license-safe, with source code, runtime screenshots, and QA notes kept together.

### Featured Projects

| Project | Evidence |
|---|---|
| [Godot 3D Environment Showcase](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-3d-environment-showcase) | PBR materials, normal / roughness / metallic study, key-fill-rim lighting, interaction, collision, camera rig |
| [Godot 3D Scene Audit Toolkit](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-3d-scene-audit-toolkit) | Scene validation, material and mesh checks, collision review, structured PASS / WARNING / ERROR report |
| [Godot Material & Lighting Lab](https://github.com/rodriguezrobertbfrkx6857-sudo/godot-material-lighting-lab) | Roughness, metallic, normal, emission, transparency, lighting presets, camera presets, live debug telemetry |

### Technical Skills

Godot 4.7 · GDScript · Real-time 3D · Procedural geometry · PBR materials · Lighting and shadows · Camera systems · Scene QA · Technical-art review · Interactive UI · Git / GitHub