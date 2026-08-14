# dsh-team

多 Agent 团队接力框架 —— 把复杂任务交给**角色化的 agent 团队**接力完成。

一个 DeepSeek Harness（`dsh`）插件：注册一套「协调 → 分析 → 编码 → 评审 → 测试」的团队角色 skill，让 agent 遇到复杂任务时自动按角色接力，而不是单枪匹马硬扛。

## 起源

这个插件的设计源于我的 [MathModeling-Agent](https://github.com/zhuobichen/MathModeling-Agent) 项目——一个 5 角色（建模/编码/解析/评审/写作）协作的数学建模多 Agent 系统。我把其中的**多 Agent 编排经验**抽离、通用化，做成了任何复杂任务都能用的 DSH 技能包。

## 团队角色

| 角色 | 职责 |
|------|------|
| `team-lead` | 协调者：分解任务、委派、汇总交付 |
| `analyst` | 分析者：需求分析、方案设计 |
| `coder` | 编码者：按方案实现 |
| `reviewer` | 评审者：质量把关、代码评审 |
| `tester` | 测试者：验证测试 |
| `team-workflow` | 接力工作流：角色分工与协作规范 |

## 接力流程

```
team-lead ──► analyst ──► coder ──► reviewer ──► tester ──► team-lead（汇总）
```

- 上一个角色的**输出**是下一个角色的**输入**
- reviewer 发现问题 → 回给 coder → 再评审
- tester 验证不通过 → 回给 coder → 再测试
- team-lead 汇总所有产出，形成最终交付

## 安装

```sh
dsh plugin --profile web add dsh-team
# 或终端 profile
dsh plugin --profile cc-tui add dsh-team
```

安装后，`dsh-team` 的 6 个技能会注册进 skill registry，agent 在遇到复杂任务时可依据这些规范用 subagent 接力。

## 使用

无需手动调用。当任务足够复杂（多模块、多步骤、需要多种能力协作）时，直接描述任务，agent 会依据 `team-workflow` 规范自动分解、委派、接力。

也可以显式触发：

```
用团队接力完成：重构这个项目的 auth 模块
```

## 项目结构

```
dsh-team/
├── cordis.yml          # bundle patch（声明插件入口）
├── package.json        # dsh.bundle manifest
├── src/index.ts        # 插件入口（注册 skills）
├── skills/             # 6 个团队角色 SKILL.md
│   ├── team-workflow/  # 接力工作流（核心）
│   ├── team-lead/
│   ├── analyst/
│   ├── coder/
│   ├── reviewer/
│   └── tester/
└── README.md
```

## License

MIT
