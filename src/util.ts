import type { MemoizeDebounce } from '~/util';

import dayjs, { Dayjs } from 'dayjs';
import { debounce, memoize, DebouncedFunc, DebounceSettings } from 'lodash';

export function date<D extends string | number | Date | Dayjs | null | undefined>(
    d: D
): D extends null | undefined ? D : string {
    return (d == null ? d : dayjs(d).format('YYYY-MM-DDTHH:mm:ss.SSSZ')) as any;
}

export function random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function sleep(time = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function memoizeDebounce<T extends (...args: any) => any>(
    func: T,
    wait = 0,
    options: DebounceSettings = {},
    resolver?: (...args: Parameters<T>) => unknown
): MemoizeDebounce<T> {
    const debounceMemo = memoize<(...args: Parameters<T>) => DebouncedFunc<T>>(
        (..._args: Parameters<T>) => debounce(func, wait, options),
        resolver
    );

    function wrappedFunction(this: MemoizeDebounce<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
        return debounceMemo(...args)(...args);
    }

    const flush: MemoizeDebounce<T>['flush'] = (...args: Parameters<T>) => {
        return debounceMemo(...args).flush();
    };

    const cancel: MemoizeDebounce<T>['cancel'] = (...args: Parameters<T>) => {
        return debounceMemo(...args).cancel();
    };

    wrappedFunction.flush = flush;
    wrappedFunction.cancel = cancel;

    return wrappedFunction;
}
