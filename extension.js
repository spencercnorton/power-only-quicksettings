import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class PowerOnlyQuickSettings extends Extension {
    enable() {
        const qs = Main.panel.statusArea.quickSettings;
        if (!qs || !qs._indicators) {
            console.warn('[power-only-quicksettings] quickSettings._indicators not found');
            return;
        }
        this._indicators = qs._indicators;

        for (const child of this._indicators.get_children())
            this._hideChild(child);

        this._indicators.connectObject('child-added', (_box, child) => {
            if (child !== this._powerIcon)
                this._hideChild(child);
        }, this);

        this._powerIcon = new St.Icon({
            icon_name: 'system-shutdown-symbolic',
            style_class: 'system-status-icon',
        });
        this._indicators.add_child(this._powerIcon);
    }

    _hideChild(child) {
        // Remember what the shell had before we touched it, so disable() can put it back.
        // Stored ON the actor rather than in a Map: a Map outlives the actor, and reading
        // a disposed GObject out of one is what made disable() log a stack trace on every
        // lock/unlock. get_children() only ever hands back live actors.
        if (child._powerOnlyPrevVisible === undefined)
            child._powerOnlyPrevVisible = child.visible;

        // A one-shot hide() does not stick. SystemIndicator recomputes its own
        // `visible` from its icons (mic goes live, device added, stream changes), which
        // silently un-hides it. Re-hide on every flip instead of tracking each
        // indicator's private sync logic.
        //
        // connectObject binds this handler to both the actor and `this`, so an actor the
        // shell destroys drops its own handler. Nothing to disconnect by hand, nothing to
        // hold a dead reference to.
        child.connectObject('notify::visible', () => {
            if (child.visible)
                child.hide();
        }, this);
        child.hide();
    }

    disable() {
        if (this._indicators) {
            this._indicators.disconnectObject(this);
            for (const child of this._indicators.get_children()) {
                if (child === this._powerIcon)
                    continue;
                // Disconnect before restoring, or the handler re-hides everything.
                child.disconnectObject(this);
                if (child._powerOnlyPrevVisible)
                    child.show();
                delete child._powerOnlyPrevVisible;
            }
        }
        if (this._powerIcon) {
            this._powerIcon.get_parent()?.remove_child(this._powerIcon);
            this._powerIcon.destroy();
            this._powerIcon = null;
        }
        this._indicators = null;
    }
}
