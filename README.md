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

## 复现原则

每个仓库都保留源代码、测试、结构化结果和 GitHub Actions。性能结论遵循“正确性 → 预热 → 重复测量 → 同步 → 统计 → 决策”的顺序；只有实际 CUDA 执行、正确性通过且环境证据完整时，才允许形成 CUDA 性能结论。

当前公开 checkout 的 CUDA 报告是在无 NVIDIA GPU、无 `nvcc` 的主机上生成的 CPU-only 证据。CPU 结果用于验证算法和实验流程，不冒充 GPU 加速；后续 CUDA 主机结果会单独保存 GPU 型号、驱动、Toolkit、原始 JSON 和 profiler 导出。

## 公开工程标准

- 中文 README、可复制命令和明确的限制说明。
- 服务项目提供 API/协议契约测试和 CI smoke 验证。
- 不提交虚拟环境、构建目录、运行数据库、日志或本机绝对路径。
- 不把历史归档记录包装成本次独立验收结果。
