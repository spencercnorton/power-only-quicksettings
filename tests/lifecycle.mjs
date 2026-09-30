#!/usr/bin/env node
// Runs the real extension.js through enable(), an indicator changing state while it is
// hidden, and disable(), against stub GNOME Shell actors. It checks the bookkeeping, not real
// St rendering: the release is still tried in a GNOME Shell session.
//   node tests/lifecycle.mjs
import assert from 'node:assert';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

class Actor {
    constructor(name, visible) { this.name = name; this._visible = visible; this.handlers = []; this.parent = null; }
    get visible() { return this._visible; }
    set visible(v) { const was = this._visible; this._visible = v; if (v !== was) this.emit('notify::visible'); }
    show() { this.visible = true; }
    hide() { this.visible = false; }
    connectObject(signal, fn, owner) { this.handlers.push({ signal, fn, owner }); }
    disconnectObject(owner) { this.handlers = this.handlers.filter(h => h.owner !== owner); }
    emit(signal, ...args) { for (const h of [...this.handlers]) if (h.signal === signal) h.fn(this, ...args); }
    get_parent() { return this.parent; }
    destroy() { this.destroyed = true; }
}
// A Quick Settings SystemIndicator: visible exactly when one of its icons is.
class Indicator extends Actor {
    constructor(name, iconVisible) { super(name, iconVisible); this.iconVisible = iconVisible; }
    _syncIndicatorsVisible() { this.visible = this.iconVisible; }
}
class Box extends Actor {
    constructor(children) { super('indicators', true); this.children = children; for (const c of children) c.parent = this; }
    get_children() { return [...this.children]; }
    add_child(c) { this.children.push(c); c.parent = this; this.emit('child-added', c); }
    remove_child(c) { this.children = this.children.filter(x => x !== c); c.parent = null; }
}

const network = new Indicator('network', true);
const microphone = new Indicator('microphone', false);
const other = new Actor('another extension, shown', true);
const otherHidden = new Actor('another extension, hidden', false);
const box = new Box([network, microphone, other, otherHidden]);
globalThis.__panel = { statusArea: { quickSettings: { _indicators: box } } };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'power-only-'));
writeFileSync(join(dir, 'St.js'), 'export default { Icon: class { constructor(p) { Object.assign(this, p); this.handlers = []; } get_parent() { return this.parent; } destroy() { this.destroyed = true; } } };');
writeFileSync(join(dir, 'ExtensionBase.js'), 'export class Extension { constructor(metadata) { this.metadata = metadata; } }');
writeFileSync(join(dir, 'Main.js'), 'export const panel = globalThis.__panel;');
writeFileSync(join(dir, 'extension.js'), readFileSync(join(root, 'extension.js'), 'utf8')
    .replace("'gi://St'", "'./St.js'")
    .replace("'resource:///org/gnome/shell/extensions/extension.js'", "'./ExtensionBase.js'")
    .replace("'resource:///org/gnome/shell/ui/main.js'", "'./Main.js'"));
const { default: Ext } = await import(pathToFileURL(join(dir, 'extension.js')).href);

const ext = new Ext({ uuid: 'power-only-quicksettings@spencercnorton.github.io' });
ext.enable();
const power = box.get_children().at(-1);
assert.equal(power.icon_name, 'system-shutdown-symbolic', 'enable() adds one power icon');
for (const a of [network, microphone, other, otherHidden])
    assert.equal(a.visible, false, `enable() hides ${a.name}`);

// The microphone goes live while hidden; GNOME Shell recomputes the indicator's visibility.
microphone.iconVisible = true;
microphone._syncIndicatorsVisible();
assert.equal(microphone.visible, false, 'an indicator that turns on while enabled stays hidden');

ext.disable();
assert.equal(network.visible, true, 'disable() shows an indicator that is on');
assert.equal(microphone.visible, true, 'disable() shows an indicator that turned on while hidden');
assert.equal(other.visible, true, 'disable() restores a visible non-indicator actor');
assert.equal(otherHidden.visible, false, 'disable() leaves a hidden non-indicator actor hidden');
assert.ok(!box.get_children().includes(power) && power.destroyed, 'disable() removes and destroys the power icon');
for (const a of [box, network, microphone, other, otherHidden])
    assert.equal(a.handlers.length, 0, `disable() leaves no handler on ${a.name}`);
console.log('ok: enable, a change while hidden, and disable all behave');
