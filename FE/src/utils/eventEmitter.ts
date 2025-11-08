type Listener<T = any> = (payload: T) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit<T = any>(event: string, payload?: T) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(payload));
  }

  clear(event?: string) {
    if (event) delete this.events[event];
    else this.events = {};
  }
}

export const eventEmitter = new EventEmitter();
