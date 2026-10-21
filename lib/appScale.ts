export const DESIGN_WIDTH = 1920;

export function getAppZoom(viewportWidth: number): number {
    return Math.min(1, viewportWidth / DESIGN_WIDTH);
}

export const appZoomScript = `(function () {
    var root = document.documentElement;
    function apply() {
        var zoom = Math.min(1, window.innerWidth / ${DESIGN_WIDTH});
        root.style.zoom = String(zoom);
        root.style.setProperty('--app-zoom', String(zoom));
    }
    apply();
    window.addEventListener('resize', apply);
})();`;
