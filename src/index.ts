/**
 * dsh-team —— 多 Agent 团队接力框架。
 *
 * 把 MathModeling-Agent（5 角色多 Agent 编排：建模/编码/解析/评审/写作）
 * 的多 Agent 协作经验，通用化成 DeepSeek Harness 的团队接力技能包。
 *
 * 本插件在启动时把 `skills/` 下的团队角色 SKILL.md 注册进 skill registry：
 *   - team-lead   协调者：分解任务、分配、汇总
 *   - analyst     分析者：需求分析、方案设计
 *   - coder       编码者：实现
 *   - reviewer    评审者：质量把关、代码评审
 *   - tester      测试者：验证
 *   - team-workflow 团队接力工作流（核心：如何按角色接力完成复杂任务）
 *
 * 注册后，agent 遇到复杂任务时可依据这些角色规范，用 subagent 能力
 * 把任务分解、委派、接力，最终由 team-lead 汇总交付。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'

/** 稳定的 cordis 插件名。 */
export const name = 'dsh-team'

/** skill registry 的最小结构视图。 */
interface SkillRegistryLike {
  register(skill: {
    name: string
    description: string
    content: string
    path?: string
    provider?: string
    source?: string
  }): () => void
}

/** 解析 SKILL.md 的 frontmatter（name / description）与正文。 */
function parseSkillMarkdown(raw: string, fallbackName: string): { name: string; description: string; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  const frontmatter = match?.[1] ?? ''
  const content = (match?.[2] ?? raw).trim()
  const skillName = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? fallbackName
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''
  return { name: skillName, description, content }
}

/** 注册 skills/ 下所有团队角色 SKILL.md。 */
function registerTeamSkills(ctx: Context): void {
  const registry = ctx.get('skills') as SkillRegistryLike | undefined
  if (!registry) return
  // import.meta.url 是 lib/index.js —— 上一级是包根，skills/ 与它同级。
  const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
  if (!existsSync(skillsRoot)) return
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = join(skillsRoot, entry.name, 'SKILL.md')
    if (!existsSync(file)) continue
    const { name: skillName, description, content } = parseSkillMarkdown(readFileSync(file, 'utf8'), entry.name)
    if (!description) continue
    try {
      registry.register({ name: skillName, description, content, path: file, provider: 'dsh-team', source: 'bundled' })
    } catch (error) {
      ctx.logger.warn(`dsh-team skill "${skillName}" skipped: ${(error as Error).message}`)
    }
  }
}

/** 插件入口：把团队角色 skills 注册进 skill registry。 */
export function apply(ctx: Context): void {
  registerTeamSkills(ctx)
}
