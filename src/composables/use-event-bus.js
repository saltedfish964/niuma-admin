import { onUnmounted } from 'vue';

function mitt(all) {
  all = all || new Map();

  return {
    all: all,

    on(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        handlers.push(handler);
      } else {
        all.set(type, [handler]);
      }
    },

    off(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        } else {
          all.set(type, []);
        }
      }
    },

    emit(type, evt) {
      let handlers = all.get(type);
      if (handlers) {
        handlers.slice().forEach((handler) => {
          handler(evt);
        });
      }

      handlers = all.get('*');
      if (handlers) {
        handlers.slice().forEach((handler) => {
          handler(type, evt);
        });
      }
    },
  };
}

const emitter = mitt();

export function useEventBus() {
  function on(event, handler) {
    emitter.on(event, handler);

    onUnmounted(() => {
      emitter.off(event, handler);
    });
  }

  function emit(event, payload) {
    emitter.emit(event, payload);
  }

  function off(event, handler) {
    emitter.off(event, handler);
  }

  return {
    on,
    emit,
    off,
  };
}
