/**
 * Generic step interface for pipeline processing
 */
export interface Step<T> {
    apply(input: T): T | Promise<T>;
}
