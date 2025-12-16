import { MessageParser } from './message-parser';

describe('MessageParser', () => {
  it('should correctly interpolate simple string values', () => {
    const template = new MessageParser('User logged in: {name}...');
    const properties = template.bindProperties('Jane Doe');
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User logged in: Jane Doe...');
  });

  it('should allow an empty template', () => {
    const template = new MessageParser();
    const properties = template.bindProperties('Jane Doe');
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('');
  });

  it('should serialize object properties in the log message', () => {
    const template = new MessageParser('User details: {user}');
    const properties = template.bindProperties({ user: { id: 1, name: 'Jane Doe' } });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User details: {"id":1,"name":"Jane Doe"}');
  });

  it('should destructure object properties directly into the log message', () => {
    const template = new MessageParser('User action: {@user}');
    const dtNow = new Date();
    const properties = template.bindProperties({ user: { action: 'login', timestamp: dtNow } });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe(`User action: {"action":"login","timestamp":"${dtNow.toISOString()}"}`);
  });

  it('should handle undefined values gracefully', () => {
    const template = new MessageParser('Undefined value: {missing}');
    const properties = template.bindProperties({});
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('Undefined value: {missing}');
  });

  it('should handle null values gracefully', () => {
    const template = new MessageParser('Null value: {value}');
    const properties = template.bindProperties({ value: null });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('Null value: null');
  });

  it('should handle complex objects with destructuring', () => {
    const template = new MessageParser('Event details: {@event}');
    const properties = template.bindProperties({
      event: { type: 'click', coordinates: { x: 100, y: 200 } },
    });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('Event details: {"type":"click","coordinates":{"x":100,"y":200}}');
  });

  it('should correctly interpolate multiple simple string values', () => {
    const template = new MessageParser('User logged in: {name} with {provider}');
    const properties = template.bindProperties('Jane Doe', 'facebook');
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User logged in: Jane Doe with facebook');
  });

  it('should correctly interpolate multiple simple string values  as object', () => {
    const template = new MessageParser('User logged in: {name} with {provider}');
    const properties = template.bindProperties({ name: 'Jane Doe', provider: 'facebook' });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User logged in: Jane Doe with facebook');
  });

  it('should serialize mixed object properties in the log message', () => {
    const template = new MessageParser('User details: {@user} with {provider}');
    const properties = template.bindProperties({ user: { id: 1, name: 'Jane Doe' } }, 'facebook');
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User details: {"id":1,"name":"Jane Doe"} with facebook');
  });

  it('should correctly interpolate simple string value from object', () => {
    const user = {
      id: 1,
      name: 'Jane Doe',
      action: 'logged in',
    };

    const template = new MessageParser('User logged in: {name}');
    const properties = template.bindProperties({ name: user.name });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User logged in: Jane Doe');
  });

  it('should correctly interpolate Date values', () => {
    const dtNow = new Date();
    const template = new MessageParser('User logged in at {timestamp}');
    const properties = template.bindProperties(dtNow);
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe(`User logged in at ${dtNow.toISOString()}`);
  });

  it('should correctly interpolate Error values', () => {
    const error = new Error('There was an error');
    const template = new MessageParser('Error: {error}');
    const properties = template.bindProperties(error);
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('Error: There was an error');
  });

  it('should correctly interpolate Array values', () => {
    const dt = new Date();
    const arr = ['first', 2, dt];
    const template = new MessageParser('Joined: {array}');
    const properties = template.bindProperties(arr);
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe(`Joined: first, 2, ${dt.toISOString()}`);
  });

  it('should correctly interpolate non existing token', () => {
    const template = new MessageParser('User logged in: {name}, age: {age}');
    const properties = template.bindProperties({ name: 'Jane Doe' });
    const output = template.render(properties.boundProperties, {});
    expect(output).toBe('User logged in: Jane Doe, age: {age}');
  });

  it('should correctly interpolate an enriched token (simulated)', () => {
    const template = new MessageParser('User logged in: {~name}, age: {~age}');
    const properties = template.bindProperties(99);
    const output = template.render(properties.boundProperties, { name: 'Jane Doe' });
    expect(output).toBe('User logged in: Jane Doe, age: {~age}');
  });
});
