export default class Message {
    #listeners = [];

    emit(msg) {
        this.#listeners.forEach((listener) => listener(msg));
    }

    listen(fn) {
        this.#listeners.push(fn);
    }
}
