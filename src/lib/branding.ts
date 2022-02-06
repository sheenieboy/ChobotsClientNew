/*
	xyz.puyo.club, xyz.puyo.club.chotopia
	Copyright (C) 2022, Puyo <hi@puyo.xyz>, all rights reserved.
*/

export interface Branding {
	name: string;
	iconPath: string; // this sucks i've put TWO strings
	nutsUrl: string; // aw hell naw three
	rpcClientId: string;
	rpcDetails: string | undefined;
	rpcLargeImage: string | undefined;
	rpcLargeImageText: string | undefined;
	rpcSmallImage: string | undefined;
	rpcSmallImageText: string | undefined;
}
