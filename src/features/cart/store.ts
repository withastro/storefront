import { createSignal } from 'solid-js';

export const CartStore = (function createCartStore() {
	const [drawerOpen, setDrawerOpen] = createSignal(false);

	return {
		get drawerOpen() {
			return drawerOpen();
		},
		setDrawerOpen(open: boolean) {
			setDrawerOpen(open);
		},
		openDrawer() {
			setDrawerOpen(true);
		},
		closeDrawer() {
			setDrawerOpen(false);
		},
		toggleDrawer() {
			setDrawerOpen((open) => !open);
		},
	};
})();
