// Generic termination operator interface for both LS and GA
export interface TerminationOperator<T> {
    shouldTerminate(state: { generation?: number; fitness?: number;[key: string]: any }): boolean;
}
