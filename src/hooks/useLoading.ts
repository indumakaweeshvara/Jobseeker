/**
 * Custom React Hook for managing loading states
 * @module hooks/useLoading
 */

import { useState, useCallback } from 'react';

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

interface UseLoadingReturn extends LoadingState {
    startLoading: () => void;
    stopLoading: () => void;
    setError: (error: string | null) => void;
    withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
}

/**
 * Custom hook for managing loading and error states
 * @returns Loading state and utility functions
 */
export const useLoading = (): UseLoadingReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startLoading = useCallback(() => {
        setIsLoading(true);
        setError(null);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const withLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await asyncFn();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return undefined;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        startLoading,
        stopLoading,
        setError,
        withLoading,
    };
};

export default useLoading;
