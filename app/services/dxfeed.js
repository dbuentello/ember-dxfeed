/* globals dx */
import Ember from 'ember';
import ENV from '../config/environment';

const URL = ENV['ember-dxfeed'].url;
const ALL_EVENTS = ['trade', 'quote', 'summary', 'profile'];

function flatten (args) {
  return Ember.isArray(args[0]) ? args[0] : args
}

export default Ember.Service.extend(Ember.Evented, {
  init () {
    this._super()
    this._dxfeed = dx.createFeed().connect(URL);
  },

  _subscriptions: Ember.computed(() => {
    return {}
  }),

  subscribeToAll (...symbols) {
    ALL_EVENTS.forEach((name) => this.subscribeTo(name, ...symbols))
    return this;
  },

  subscribeTo(name, ...symbols) {
    var subscriptions = this.get('_subscriptions');
    var subscription = subscriptions[name]
    if (!subscription) {
      var eventType = Ember.String.capitalize(name);
      subscription = subscriptions[name] = this.get('_dxfeed').createSubscription(eventType);
      subscription.onEvent = (data) => this.trigger(name, data);
    }

    subscription.addSymbols(...symbols);
    return this;
  },

  unsubscribeToAll(...symbols) {
    ALL_EVENTS.forEach((name) => this.unsubscribeTo(name, symbols))
    return this;
  },

  unsubscribeTo(name, ...symbols) {
    var subscriptions = this.get('_subscriptions');
    var subscription = subscriptions[name]
    if (subscription) {
      subscription.removeSymbols(...symbols);
    }
    return this;
  }
});
