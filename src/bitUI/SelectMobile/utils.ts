export function selectMobilePxToRem(px: number) {
    const value = window.getComputedStyle(document.documentElement).fontSize;
    if (value.indexOf('px') !== -1) {
        const htmlFontSize = Number(value.replace('px', ''));
        return px / htmlFontSize + 'rem';
    }
    return px + 'px';
}
