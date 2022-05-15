export const isEmpty = (val: any) =>
    val === null || val === undefined || !(Object.keys(val) || val).length;
