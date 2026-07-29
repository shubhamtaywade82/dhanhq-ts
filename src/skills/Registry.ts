import type { DhanClient } from "../client/DhanClient";
import { DhanError } from "../errors";
import type { Skill, SkillContext, SkillDefinition } from "./Skill";

export interface SkillListing extends SkillDefinition {
  steps: string[];
}

/**
 * Named lookup for trading skills.
 *
 * Every registered skill is also surfaced as an MCP tool named
 * `dhan_skill_<name>`, gated by the risk and scope the skill declares.
 */
export class SkillRegistry {
  private readonly skills = new Map<string, Skill<SkillContext>>();

  public register(skill: Skill<SkillContext>): this {
    this.skills.set(skill.definition.name, skill);
    return this;
  }

  public registerAll(skills: Array<Skill<SkillContext>>): this {
    for (const skill of skills) {
      this.register(skill);
    }
    return this;
  }

  public has(name: string): boolean {
    return this.skills.has(name);
  }

  public find(name: string): Skill<SkillContext> {
    const skill = this.skills.get(name);

    if (!skill) {
      throw new DhanError(`Unknown skill: ${name}`, {
        code: "SKILL_NOT_FOUND",
        details: { name, available: this.names() },
      });
    }

    return skill;
  }

  public names(): string[] {
    return [...this.skills.keys()].sort();
  }

  /** Every skill with its parameters and steps, for tool listings. */
  public list(): SkillListing[] {
    return [...this.skills.values()].map((skill) => ({
      ...skill.definition,
      steps: skill.stepNames(),
    }));
  }

  public async call(
    name: string,
    args: Record<string, unknown>,
    client: DhanClient,
  ): Promise<Record<string, unknown>> {
    const result = await this.find(name).call(args, client);

    // The client is an execution dependency, not part of the result — leaving
    // it in would serialize an entire HTTP stack into an MCP tool response.
    const { client: _client, ...rest } = result;
    return rest;
  }

  public clear(): void {
    this.skills.clear();
  }
}
