let cookieStoreInstance = new Map();

export function resetMockCookies(initialMap = new Map()) {
    cookieStoreInstance = new Map(initialMap);
}

export function getMockCookieMap() {
    return cookieStoreInstance;
}

export async function cookies() {
    return {
        get: (name) => ({ value: cookieStoreInstance.get(name) }),
        set: (name, val) => cookieStoreInstance.set(name, val),
        delete: (name) => cookieStoreInstance.delete(name),
        has: (name) => cookieStoreInstance.has(name),
    };
}
