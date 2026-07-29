import type { AgentScope, ToolRisk } from "./Policy";

/** A JSON Schema fragment. Kept loose — schemas are data, not typed shapes. */
export type JsonSchema = Record<string, unknown>;

export interface ToolExample {
  input: Record<string, unknown>;
  output: string;
}

/**
 * A single tool exposed to MCP clients and agent runtimes.
 *
 * `scope` is the {@link Policy} scope required to call it; `risk` decides
 * whether the call also needs the live-trading gate.
 */
export interface Tool {
  name: string;
  description: string;
  scope: AgentScope;
  risk: ToolRisk;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  version: string;
  examples?: ToolExample[];
  handler(args: Record<string, unknown>): Promise<unknown>;
}

/** Client-facing metadata — everything except the handler. */
export type ToolDescriptor = Omit<Tool, "handler">;

export function describeTool(tool: Tool): ToolDescriptor {
  const { handler: _handler, ...descriptor } = tool;
  return descriptor;
}

/** True when calling this tool changes account state. */
export function isWriteTool(tool: Pick<Tool, "risk">): boolean {
  return tool.risk.endsWith("write");
}
