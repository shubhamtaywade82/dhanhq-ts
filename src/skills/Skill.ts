import type { AgentScope, ToolRisk } from "../agent/Policy";
import type { DhanClient } from "../client/DhanClient";
import { DhanError } from "../errors";
import type {
  NormalizedOptionChain,
  OptionLeg,
  StrikeEntry,
} from "../resources/OptionChain";

export type SkillParamType = "string" | "integer" | "number" | "boolean";

export interface SkillParam {
  type: SkillParamType;
  required?: boolean;
  default?: unknown;
  description?: string;
}

export interface SkillDefinition {
  name: string;
  description: string;
  /**
   * Defaults to the most conservative tier so a skill that forgets to declare
   * one fails safe rather than exposing an ungated write.
   */
  risk: ToolRisk;
  scope: AgentScope;
  params: Record<string, SkillParam>;
}

/** Accumulated state threaded through a skill's steps. */
export interface SkillContext extends Record<string, unknown> {
  client: DhanClient;
}

export interface SkillStep<TContext extends SkillContext = SkillContext> {
  name: string;
  run(context: TContext): Promise<TContext> | TContext;
}

/**
 * Base class for composable trading skills.
 *
 * A skill is a named sequence of steps over a shared context. Steps run in
 * declaration order and each returns the context for the next, so a skill
 * stays inspectable — the registry can list its steps without running it.
 *
 * Skills that build multi-leg positions stop at an `intent`: they resolve
 * strikes and premiums but never place orders, leaving execution to an
 * explicit, separately-gated call.
 */
export abstract class Skill<TContext extends SkillContext = SkillContext> {
  public abstract readonly definition: SkillDefinition;

  protected abstract steps(): Array<SkillStep<TContext>>;

  /** Runs every step in order and returns the final context. */
  public async call(
    args: Record<string, unknown>,
    client: DhanClient,
  ): Promise<TContext> {
    let context = this.buildContext(args, client);
    this.validate(context);

    for (const step of this.steps()) {
      context = await step.run(context);
    }

    return context;
  }

  /** Step names in execution order, for tool listings and docs. */
  public stepNames(): string[] {
    return this.steps().map((step) => step.name);
  }

  protected buildContext(
    args: Record<string, unknown>,
    client: DhanClient,
  ): TContext {
    const context: Record<string, unknown> = { client };

    for (const [name, config] of Object.entries(this.definition.params)) {
      const value = args[name];
      context[name] = value === undefined ? config.default : value;
    }

    return context as TContext;
  }

  protected validate(context: Record<string, unknown>): void {
    for (const [name, config] of Object.entries(this.definition.params)) {
      if (config.required && context[name] === undefined) {
        throw new DhanError(`Missing required parameter: ${name}`, {
          code: "SKILL_PARAM_MISSING",
          details: { skill: this.definition.name, param: name },
        });
      }
    }
  }
}

/** The call or put leg of a strike. */
export function legSide(
  entry: StrikeEntry,
  optionType: "CE" | "PE",
): OptionLeg | undefined {
  return optionType === "CE" ? entry.call : entry.put;
}

export function legSecurityId(
  entry: StrikeEntry,
  optionType: "CE" | "PE",
): string | undefined {
  const id = legSide(entry, optionType)?.security_id;
  return id != null ? String(id) : undefined;
}

export function legPremium(
  entry: StrikeEntry,
  optionType: "CE" | "PE",
): number | undefined {
  return legSide(entry, optionType)?.last_price;
}

export interface ResolvedChain {
  securityId: string;
  spotPrice: number;
  chain: NormalizedOptionChain;
}

/**
 * Resolves a symbol to its spot price and option chain — the opening move of
 * every option-structure skill.
 */
export async function resolveChain(
  client: DhanClient,
  symbol: string,
  expiry: string,
  segment: string,
): Promise<ResolvedChain> {
  const instrument = await client.instruments.find(segment, symbol, {
    exactMatch: true,
  });

  if (!instrument) {
    throw new DhanError(`Could not resolve symbol ${symbol} in ${segment}`, {
      code: "INSTRUMENT_NOT_FOUND",
      details: { symbol, segment },
    });
  }

  const chain = await client.optionChain.fetchNormalized({
    underlyingScrip: Number(instrument.securityId),
    underlyingSeg: segment,
    expiry,
  });

  // The chain response carries the underlying's last price, which saves a
  // second market-feed call for the spot.
  const spotPrice =
    chain.lastPrice ??
    (await client.marketFeed.ltpFor(segment, instrument.securityId));

  if (spotPrice === undefined) {
    throw new DhanError(`Could not resolve spot price for ${symbol}`, {
      code: "SPOT_PRICE_UNAVAILABLE",
      details: { symbol, segment },
    });
  }

  return { securityId: instrument.securityId, spotPrice, chain };
}

/** {@link resolveChain} against the index segment. */
export function resolveIndexChain(
  client: DhanClient,
  symbol: string,
  expiry: string,
): Promise<ResolvedChain> {
  return resolveChain(client, symbol, expiry, "IDX_I");
}

/** {@link resolveChain} against the NSE cash segment. */
export function resolveEquityChain(
  client: DhanClient,
  symbol: string,
  expiry: string,
): Promise<ResolvedChain> {
  return resolveChain(client, symbol, expiry, "NSE_EQ");
}
