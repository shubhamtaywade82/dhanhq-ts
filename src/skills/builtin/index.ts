import { SkillRegistry } from "../Registry";
import type { Skill, SkillContext } from "../Skill";
import { CoveredCallSkill, ProtectivePutSkill } from "./equityOverlays";
import { MarketDataSummarizerSkill } from "./marketDataSummarizer";
import {
  BearCallSpreadSkill,
  BullPutSpreadSkill,
  BuyAtmCallSkill,
  IronCondorSkill,
  StraddleSkill,
  StrangleSkill,
} from "./optionStructures";
import {
  SquareOffAllSkill,
  SquareOffPositionSkill,
} from "./positionManagement";

export * from "./equityOverlays";
export * from "./marketDataSummarizer";
export * from "./optionStructures";
export * from "./positionManagement";

/** Fresh instances of every builtin skill. */
export function builtinSkills(): Array<Skill<SkillContext>> {
  return [
    new BuyAtmCallSkill(),
    new StraddleSkill(),
    new StrangleSkill(),
    new IronCondorSkill(),
    new BullPutSpreadSkill(),
    new BearCallSpreadSkill(),
    new CoveredCallSkill(),
    new ProtectivePutSkill(),
    new SquareOffAllSkill(),
    new SquareOffPositionSkill(),
    new MarketDataSummarizerSkill(),
  ] as Array<Skill<SkillContext>>;
}

/** A registry preloaded with every builtin skill. */
export function createSkillRegistry(): SkillRegistry {
  return new SkillRegistry().registerAll(builtinSkills());
}
