import { Bot, Context } from "grammy";

type eventFunctionType = (ctx?: Context) => void;

type eventData = {
  name: string;
  id: number;
  execute: eventFunctionType;
  once: boolean;
};

class EventsHandler {
  private _eventsList = new Map<number, eventData>();

  constructor() {}

  on(eventName: string, eventFunction: eventFunctionType): number {
    const id = this._getRandomId();

    const eventData = {
      name: eventName,
      id: id,
      execute: eventFunction,
      once: false,
    };

    this._eventsList.set(id, eventData);
    return id;
  }

  once(eventName: string, eventFunction: eventFunctionType): number {
    const id = this._getRandomId();

    const eventData = {
      name: eventName,
      id: id,
      execute: eventFunction,
      once: true,
    };

    this._eventsList.set(id, eventData);
    return id;
  }

  /** Удалить слушатель события */

  off(eventId: number): boolean {
    const eventForDelete = this._eventsList.get(eventId);

    if (!eventForDelete) return false;

    this._eventsList.delete(eventId);
    return true;
  }

  private _getRandomId() {
    let id = 0;

    do {
      id = Math.floor(Math.random() * (100000 - 1 + 1)) + 1;
    } while (this._eventsList.has(id));

    return id;
  }

  emit(eventName: string, ...args: any) {
    this._eventsList.forEach((event) => {
      if (event.name != eventName) return;

      event.execute(...args);

      if (event.once) {
        this._eventsList.delete(event.id);
      }
    });
  }
}

export default EventsHandler;
