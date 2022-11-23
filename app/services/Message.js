const listeners = [];

export default class Message {
    emit(msg) {
        listeners.forEach((listener) => listener(msg));
    }

    listen(fn) {
        listeners.push(fn);
    }
}
