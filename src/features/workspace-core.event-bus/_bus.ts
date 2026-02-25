// [職責] 事件發布/訂閱引擎 (The Bus)
// Per logic-overview.v3.md:
//   WORKSPACE_EVENT_BUS -.->|事件契約遵循| SK_EVENT_ENVELOPE
//   WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER (Observability)
//   WORKSPACE_EVENT_BUS --> DOMAIN_METRICS   (Observability)
import type {
  WorkspaceEventName,
  WorkspaceEventHandler,
  PublishFn,
  SubscribeFn,
  WorkspaceEventPayloadMap,
} from "./_events"
import type { ImplementsEventEnvelopeContract } from "@/shared-kernel/events/event-envelope"
import { recordEventPublished } from "@/shared/observability"

// A map where keys are event names (strings) and values are arrays of handler functions (Observers).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerRegistry = Map<WorkspaceEventName, WorkspaceEventHandler<any>[]>

/**
 * The Subject in the Observer pattern. It maintains a list of Observers (handlers)
 * and notifies them when an event occurs.
 *
 * Implements shared-kernel.event-envelope contract (Invariant #8).
 */
export class WorkspaceEventBus implements ImplementsEventEnvelopeContract {
  /** Marker: this bus implements the shared-kernel.event-envelope contract. */
  readonly implementsEventEnvelope = true as const;

  private handlers: HandlerRegistry

  constructor() {
    this.handlers = new Map()
  }

  publish: PublishFn = <T extends WorkspaceEventName>(
    type: T,
    payload: WorkspaceEventPayloadMap[T]
  ) => {
    // DOMAIN_METRICS — record every published event
    recordEventPublished(type)
    const eventHandlers = this.handlers.get(type)
    if (eventHandlers) {
      const handlersCopy = [...eventHandlers]
      handlersCopy.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error)
        }
      })
    }
  }

  emit: PublishFn = this.publish

  subscribe: SubscribeFn = <T extends WorkspaceEventName>(
    type: T,
    handler: (payload: WorkspaceEventPayloadMap[T]) => void
  ) => {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, [])
    }

    const handlerList = this.handlers.get(type)!
    handlerList.push(handler)

    return () => {
      const index = handlerList.indexOf(handler)
      if (index > -1) {
        handlerList.splice(index, 1)
      }
    }
  }

  on: SubscribeFn = this.subscribe
}
