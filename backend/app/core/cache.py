from __future__ import annotations

import time
from typing import Any


class MemoryCache:
    def __init__(self):
        self._store: dict[str, Any] = {}
        self._expires: dict[str, float] = {}

    def get(self, key: str) -> Any | None:
        if key in self._expires:
            if time.time() > self._expires[key]:
                del self._store[key]
                del self._expires[key]
                return None
        return self._store.get(key)

    def set(self, key: str, value: Any, ttl_seconds: int = 60):
        self._store[key] = value
        self._expires[key] = time.time() + ttl_seconds

    def delete(self, key: str):
        self._store.pop(key, None)
        self._expires.pop(key, None)

    def clear(self):
        self._store.clear()
        self._expires.clear()

    def get_or_set(self, key: str, factory, ttl_seconds: int = 60) -> Any:
        cached = self.get(key)
        if cached is not None:
            return cached
        value = factory()
        self.set(key, value, ttl_seconds)
        return value


cache = MemoryCache()
