export function daysToWeeksDays<T>(arr: T[] = []) {
    const result: T[][] = [];
    arr.forEach((item, index) => {
        const i = Math.floor(index / 7);
        if (!result[i]) {
            result[i] = [];
        }
        result[i].push(item);
    });

    return result;
}
