// [職責] 事件發布/訂閱引擎 (The Bus)
import type {
  WorkspaceEventName,
  WorkspaceEventHandler,
  PublishFn,
  SubscribeFn,
  WorkspaceEventPayloadMap,
} from "./workspace-events";

// A map where keys are event names (strings) and values are arrays of handler functions (Observers).
type HandlerRegistry = Map<
  WorkspaceEventName,
  WorkspaceEventHandler<any>[]
>;

/**
 * The Subject in the Observer pattern. It maintains a list of Observers (handlers)
 * and notifies them when an event occurs.
 */
export class WorkspaceEventBus {
  private handlers: HandlerRegistry;

  constructor() {
    this.handlers = new Map();
  }

  publish: PublishFn = <T extends WorkspaceEventName>(
    type: T,
    payload: WorkspaceEventPayloadMap[T]
  ) => {
    const eventHandlers = this.handlers.get(type);
    if (eventHandlers) {
      const handlersCopy = [...eventHandlers];
      handlersCopy.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  };

  emit: PublishFn = this.publish;

  subscribe: SubscribeFn = <T extends WorkspaceEventName>(
    type: T,
    handler: (payload: WorkspaceEventPayloadMap[T]) => void
  ) => {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    const handlerList = this.handlers.get(type)!;
    handlerList.push(handler);

    return () => {
      const index = handlerList.indexOf(handler);
      if (index > -1) {
        handlerList.splice(index, 1);
      }
    };
  };

  on: SubscribeFn = this.subscribe;
}
