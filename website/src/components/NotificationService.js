class NotificationService {
  constructor() {
    this.subscribers = [];
  }

  subscribe(handler) {
    this.subscribers.push(handler);
  }

  unsubscribe(handler) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== handler);
  }

  notify(message) {
    this.subscribers.forEach(handler => handler(message));
  }

  analyzeTraffic(trafficData) {
    if (trafficData.highTraffic) {
      this.notify("Traffic is unusually high right now.");
    }
  }
}

export default new NotificationService();
