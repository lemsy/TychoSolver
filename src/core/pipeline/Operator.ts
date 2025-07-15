/**
 * Generic operator interface for pipeline processing
 */
export interface Operator<T> {
    apply(input: T): T | Promise<T>;
}
