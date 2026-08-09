export function getHttpErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (typeof error !== 'object' || error === null) {
        return fallback;
    }

    if (!('error' in error)) {
        return fallback;
    }

    const responseError =
        error.error as { message?: unknown };

    return typeof responseError.message === 'string'
        ? responseError.message
        : fallback;
}
