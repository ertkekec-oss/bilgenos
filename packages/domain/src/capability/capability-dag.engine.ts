import { CapabilityKey, CapabilityState } from '@bilgenos/contracts';
import {
  CapabilityCycleError,
  CapabilityDependencyError,
  InvariantViolationError,
} from '../shared/domain-error.js';

export interface CapabilityRule {
  key: CapabilityKey;
  dependencies: CapabilityKey[];
  allowReadOnly: boolean;
}

export class CapabilityDagEngine {
  private readonly rules: Map<CapabilityKey, CapabilityRule> = new Map();

  constructor() {
    this.registerDefaultRules();
    this.validateGraphForCycles();
  }

  private registerDefaultRules(): void {
    this.addRule('ACADEMIC', [], true);
    this.addRule('CURRICULUM', ['ACADEMIC'], true);
    this.addRule('ASSESSMENT', ['CURRICULUM'], true);
    this.addRule('QUESTION_BANK', ['ASSESSMENT'], true);
    this.addRule('EXAM_PREP', ['ASSESSMENT', 'QUESTION_BANK'], true);
    this.addRule('ATTENDANCE', ['ACADEMIC'], true);
    this.addRule('FINANCE', [], true);
    this.addRule('TRANSPORTATION', [], true);
    this.addRule('TRANSPORTATION_FLEET', ['TRANSPORTATION'], true);
    this.addRule('TRANSPORTATION_ROUTES', ['TRANSPORTATION'], true);
    this.addRule('TRANSPORTATION_PASSENGERS', ['TRANSPORTATION_ROUTES'], true);
    this.addRule('TRANSPORTATION_TRIPS', ['TRANSPORTATION_FLEET', 'TRANSPORTATION_ROUTES'], true);
    this.addRule('TRANSPORTATION_HANDOVER', ['TRANSPORTATION_TRIPS', 'TRANSPORTATION_PASSENGERS'], true);
    this.addRule('TRANSPORT_TRACKING', ['TRANSPORTATION_TRIPS'], false);
    this.addRule('CAFETERIA', [], true);
    this.addRule('GUIDANCE', ['ACADEMIC'], true);
    this.addRule('CRM', [], true);
    this.addRule('COMMUNICATION', [], true);
    this.addRule('CAMPUS', [], true);
    this.addRule('CAMPUS_OPERATIONS', [], true);
    this.addRule('PHYSICAL_SPACES', ['CAMPUS_OPERATIONS'], true);
    this.addRule('ASSET_MANAGEMENT', ['CAMPUS_OPERATIONS'], true);
    this.addRule('ASSET_CUSTODY', ['ASSET_MANAGEMENT'], true);
    this.addRule('ASSET_TRANSFER', ['ASSET_MANAGEMENT'], true);
    this.addRule('AI', ['ACADEMIC'], false);
  }

  public addRule(key: CapabilityKey, dependencies: CapabilityKey[], allowReadOnly: boolean = true): void {
    this.rules.set(key, { key, dependencies, allowReadOnly });
  }

  /**
   * Validates that the dependency graph has no cycles using Depth-First Search (DFS).
   */
  public validateGraphForCycles(): void {
    const visited = new Set<CapabilityKey>();
    const recursionStack = new Set<CapabilityKey>();

    const checkCycle = (node: CapabilityKey, path: CapabilityKey[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const rule = this.rules.get(node);
      if (rule) {
        for (const dep of rule.dependencies) {
          if (!visited.has(dep)) {
            checkCycle(dep, [...path]);
          } else if (recursionStack.has(dep)) {
            path.push(dep);
            throw new CapabilityCycleError(path);
          }
        }
      }

      recursionStack.delete(node);
    };

    for (const key of this.rules.keys()) {
      if (!visited.has(key)) {
        checkCycle(key, []);
      }
    }
  }

  /**
   * Validates whether a target capability can be transitioned to the specified state given current states.
   */
  public validateTransition(
    currentStates: Map<CapabilityKey, CapabilityState>,
    target: CapabilityKey,
    newState: CapabilityState
  ): void {
    const rule = this.rules.get(target);
    if (!rule) {
      throw new InvariantViolationError(`Unknown capability '${target}'`);
    }

    if (newState === 'READ_ONLY' && !rule.allowReadOnly) {
      throw new InvariantViolationError(`Capability '${target}' does not support READ_ONLY state.`);
    }

    if (newState === 'ENABLED') {
      for (const dep of rule.dependencies) {
        const depState = currentStates.get(dep) ?? 'DISABLED';
        if (depState !== 'ENABLED' && depState !== 'READ_ONLY') {
          throw new CapabilityDependencyError(target, dep);
        }
      }
    }

    if (newState === 'DISABLED' || newState === 'SUSPENDED') {
      // Check if any active capability depends on this one
      for (const [otherKey, otherRule] of this.rules.entries()) {
        const otherState = currentStates.get(otherKey) ?? 'DISABLED';
        if ((otherState === 'ENABLED' || otherState === 'READ_ONLY') && otherRule.dependencies.includes(target)) {
          throw new InvariantViolationError(
            `Cannot disable '${target}'. Active capability '${otherKey}' depends on it.`
          );
        }
      }
    }
  }

  /**
   * Checks if mutation operations are permitted for a given capability state.
   */
  public static canMutate(state: CapabilityState): boolean {
    return state === 'ENABLED';
  }

  /**
   * Checks if read operations are permitted for a given capability state.
   */
  public static canRead(state: CapabilityState): boolean {
    return state === 'ENABLED' || state === 'READ_ONLY';
  }
}
