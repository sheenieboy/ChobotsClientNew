/*
	xyz.puyo.club, xyz.puyo.club.chotopia
	Copyright (C) 2022, Puyo <hi@puyo.xyz>, all rights reserved.
*/

import * as uuid from 'uuid';

class PageState {
	id: string; // FIXME: why does uuid.v4() return a fucking string?!?! what the hell is wrong with javascript developers?!?!?! jesus christ!
	url: string; // FIXME: url type?

	constructor(url: string) {
		this.id = uuid.v4();
		this.url = url;
	}
}

interface WindowState {
	maximized: boolean;
	focused: boolean;
	fullscreen: boolean;
	muted: boolean;

	buttons: 'ingame' | 'none';

	currentPage: PageState;
}

export { PageState, WindowState }
